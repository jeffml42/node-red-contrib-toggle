module.exports = function(RED) {
    function ToggleNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.config = config;

        node.state = 'unknown';
        node.onValue = RED.util.evaluateNodeProperty(config.onValue, config.onType, null);
        node.offValue = RED.util.evaluateNodeProperty(config.offValue, config.offType, null);
        node.toggleValue = config.toggleType != 'any' ? RED.util.evaluateNodeProperty(config.toggleValue, config.toggleType, null) : "__ANY__";

        node.on('input', function(msg, send, error) {
            send = send || function() { node.send.apply(node, arguments) };
            error = error || function(err) { node.error(err, msg) };

            if ((node.config.onOffTopic == "" || node.config.onOffTopic == msg.topic) && msg.payload == node.onValue) {
                var oldState = node.state;
                node.state = true;
                if (node.config.passOnOff == 'always' || (node.config.passOnOff == 'ifChanged' && oldState != node.state))
                    send(msg);
                if (node.config.viewStatus == 'Yes')
                    this.status({fill:"green",shape:"dot",text:"ON"});
                    
            } else if ((node.config.onOffTopic == "" || node.config.onOffTopic == msg.topic) && msg.payload == node.offValue) {
                var oldState = node.state;
                node.state = false;
                if (node.config.passOnOff == 'always' || (node.config.passOnOff == 'ifChanged' && oldState != node.state))
                    send(msg);

                if (node.config.viewStatus == 'Yes')
                    this.status({fill:"red",shape:"dot",text:"OFF"});
                    
            } else if ((node.config.toggleTopic == "" || node.config.toggleTopic == msg.topic) && (node.toggleValue == '__ANY__' || msg.payload == node.toggleValue)) {
                node.state = node.state == 'unknown' ? true : !node.state;

                msg.payload = node.state ? node.onValue : node.offValue;
                send(msg);

                if (node.config.viewStatus == 'Yes') {
                    if (node.state)
                        this.status({fill:"green",shape:"dot",text:"ON"});
                    else
                        this.status({fill:"red",shape:"dot",text:"OFF"});
                }
            }
        });
    }
    RED.nodes.registerType('toggle', ToggleNode);
}
