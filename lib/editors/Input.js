var React = require('react');

var Component = React.createClass({displayName: "Component",
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
            React.createElement("input", {type: "text", value: this.state.value, onChange: this.onChange})
        );
    }
});

module.exports = Component;