import quip from "quip";
import App from "./containers/App/App";

import { Root, Timeslot, Response } from './model';

quip.apps.registerClass(Root, 'root');
quip.apps.registerClass(Timeslot, 'timeslot');
quip.apps.registerClass(Response, 'response');

quip.apps.initialize({
    initializationCallback: function(rootNode) {
        const rootRecord = quip.apps.getRootRecord();

        ReactDOM.render(<App record={rootRecord} />, rootNode);
    },
});
