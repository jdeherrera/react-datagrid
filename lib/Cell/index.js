'use strict';

var React  = require('react')
var assign = require('object-assign')
var normalize = require('react-style-normalizer')

var EVENT_NAMES = require('react-event-names')

var TEXT_ALIGN_2_JUSTIFY = {
    right : 'flex-end',
    center: 'center'
}

function copyProps(target, source, list){

    list.forEach(function(name){
        if (name in source){
            target[name] = source[name]
        }
    })

}

module.exports = React.createClass({

    displayName: 'ReactDataGrid.Cell',

    propTypes: {
        className  : React.PropTypes.string,
        textPadding: React.PropTypes.oneOfType([
            React.PropTypes.number,
            React.PropTypes.string
        ]),
        style      : React.PropTypes.object,
        text       : React.PropTypes.any,
        rowIndex   : React.PropTypes.number,
        onCellClick: React.PropTypes.func,
        onCellEdit : React.PropTypes.func
    },

    getDefaultProps: function(){
        return {
            text: '',
            defaultClassName: 'z-cell'
        }
    },

    componentDidUpdate: function(prevProps, prevState) {
        if (!prevProps.editing && this.props.editing) {
            this.bindEditorListeners();
            return;
        }
    },

    componentWillUnmount: function() {
        this.unbindEditorListeners();
    },

    bindEditorListeners: function() {
        document.addEventListener('keydown', this.keyDownListener = this.onKeyDown, false);
        document.addEventListener('click', this.documentClickListener = this.onDocumentClick, false);
    },

    unbindEditorListeners: function() {
        document.removeEventListener('keydown', this.keyDownListener);
        document.removeEventListener('click', this.documentClickListener);
    },

    onKeyDown: function(e) {
        if (e.keyCode === 13 || e.keyCode === 9) {
            // Enter and Tab "save" the value
            this.onDataEdited();
        }
        else if (e.keyCode === 27) {
            // Esc cancels editing
            this.doneEditing();
        }
    },

    onDocumentClick: function(e) {
        var target = e.target;
        var node = React.findDOMNode(this);

        if (target === node || node.contains(target)) {
            return;
        }

        this.onDataEdited();
    },


    onClick: function(e) {
        // Do nothing if already editing or selecting rows
        if (this.props.editing || e.metaKey || e.ctrlKey || e.shiftKey) {
            return;
        }

        // Trickery to allow the document click to be handled by an editing cell first
        setTimeout(function() {
            if (this.props.onCellClick) {
                this.props.onCellClick(this.props, e);
            }
        }.bind(this), 0);
    },

    onDataEdited: function() {
        var props = this.props;
        var component = this.refs.component;
        var value, column, columnName;

        if (!component) {
            return;
        }

        value = (typeof component.getValue === 'function') ? component.getValue() : component.state && component.state.value;
        this.doneEditing(value);
    },

    doneEditing: function(value) {
        var props = this.props;
        var column, columnName;

        if (props.onCellEdit) {
            column = props.columns && props.columns[props.index];
            columnName = column && column.name;

            props.onCellEdit(props.rowIndex, columnName, value);
        }

        // No need to listen any longer
        this.unbindEditorListeners();
    },

    renderCustomComponent:function(CustomComponent, props) {
        if (!CustomComponent) {
            return null;
        }

        return (
            React.createElement(CustomComponent, React.__spread({ref: "component"},  props))
        );
    },

    render: function(){
        var props     = this.props

        var columns   = props.columns
        var index     = props.index
        var column    = columns? columns[index]: null
        var className = props.className || ''
        var textAlign = column && column.textAlign
        var Renderer  = column && column.renderer;
        var Editor    = column && column.editor;
        var editing   = props.editing;
        var text      = props.renderText?
            props.renderText(props.text, column, props.rowIndex):
            props.text

        var textCellProps = {
            className: 'z-text',
            style    : {padding: props.textPadding, margin: 'auto 0'}
        }

        var componentCell, textCell;

        if (props.rowIndex != null) {
            componentCell = this.renderCustomComponent(editing && Editor, props) || this.renderCustomComponent(Renderer, props);
        }

        if (!componentCell) {
            textCell = props.renderCell?
                props.renderCell(textCellProps, text, props):
                React.DOM.div(textCellProps, text)
        }

        if (!index){
            className += ' z-first'
        }
        if (columns && index == columns.length - 1){
            className += ' z-last'
        }

        if (textAlign){
            className += ' z-align-' + textAlign
        }

        className += ' ' + props.defaultClassName

        var sizeStyle = column && column.sizeStyle
        var cellProps = {
            className: className,
            style    : normalize(assign({}, props.style, sizeStyle))
        }

        copyProps(cellProps, props, [
            'onMouseOver',
            'onMouseOut',
            'onClick',
            'onCellClick',
            'onCellEdit'
        ].concat([
                EVENT_NAMES.onMouseDown,
                EVENT_NAMES.onMouseUp
            ]))

        var innerStyle = props.innerStyle

        if (textAlign){
            innerStyle = assign({}, innerStyle, {
                justifyContent: column.style.justifyContent || TEXT_ALIGN_2_JUSTIFY[column.textAlign]
            })
        }

        var c = React.createElement("div", {className: "z-inner", style: innerStyle, onClick: this.onClick}, 
             componentCell || textCell
        )

        // var c = {textCell}
        return (
            React.createElement("div", React.__spread({},  cellProps), 
                c, 
                props.children
            )
        )
    }
})