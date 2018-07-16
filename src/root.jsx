import quip from "quip";
import App from "./containers/App/App";

quip.apps.initialize({
    initializationCallback: function(rootNode) {
        ReactDOM.render(<App/>, rootNode);
    },
});
