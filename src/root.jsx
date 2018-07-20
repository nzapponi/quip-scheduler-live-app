import quip from "quip";
import moment from 'moment';
import App from "./containers/App/App";

import { Root, Timeslot, Response } from './model';

quip.apps.registerClass(Root, 'root');
quip.apps.registerClass(Timeslot, 'timeslot');
quip.apps.registerClass(Response, 'response');

quip.apps.initialize({
    initializationCallback: function(rootNode) {
        const rootRecord = quip.apps.getRootRecord();
    
        const userLocale = window.navigator.userLanguage || window.navigator.language;
        moment.locale(userLocale);

        ReactDOM.render(<App record={rootRecord} />, rootNode);
    },
});
