var React = require('react');

var Component = React.createClass({
    getInitialState: function() {
        return {
            value: this.props.text
        };
    },

    onChange: function() {
        var node = React.findDOMNode(this);

        this.setState({
            value: node.value
        });
    },

    render: function() {
        return (
            <input type="text" value={this.state.value} onChange={this.onChange}></input>
        );
    }
});

module.exports = Component;