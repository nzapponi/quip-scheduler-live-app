import React, { Component } from 'react';

import Styles from './Tooltip.less';

class Tooltip extends Component {

    componentDidMount() {
        if (this.props.showBackdrop) {
            quip.apps.showBackdrop(this.props.onDismiss);
        }
        quip.apps.addDetachedNode(ReactDOM.findDOMNode(this.dialogNode_));
        quip.apps.addEventListener(quip.apps.EventType.BLUR, this.props.onBlur);
    }

    componentWillUnmount() {
        if (this.props.showBackdrop) {
            quip.apps.dismissBackdrop();
        } else if (this.props.onDismiss) {
            this.props.onDismiss();
        }
        quip.apps.removeDetachedNode(ReactDOM.findDOMNode(this.dialogNode_));
        quip.apps.removeEventListener(quip.apps.EventType.BLUR, this.props.onBlur);
    }
    
    render() { 
        return <div ref={(node) => this.dialogNode_ = node} className={Styles.Tooltip}>
            {this.props.children}
        </div>;
    }
}
 
export default Tooltip;