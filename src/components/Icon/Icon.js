import React from 'react';

const icon = (props) => {
    switch (props.type) {
        case 'add':
            return <svg xmlns="http://www.w3.org/2000/svg" width={props.width} height={props.height} viewBox="0 0 52 52"><path fill={props.color} d="m30 29h16.5c0.8 0 1.5-0.7 1.5-1.5v-3c0-0.8-0.7-1.5-1.5-1.5h-16.5c-0.6 0-1-0.4-1-1v-16.5c0-0.8-0.7-1.5-1.5-1.5h-3c-0.8 0-1.5 0.7-1.5 1.5v16.5c0 0.6-0.4 1-1 1h-16.5c-0.8 0-1.5 0.7-1.5 1.5v3c0 0.8 0.7 1.5 1.5 1.5h16.5c0.6 0 1 0.4 1 1v16.5c0 0.8 0.7 1.5 1.5 1.5h3c0.8 0 1.5-0.7 1.5-1.5v-16.5c0-0.6 0.4-1 1-1z"></path></svg>;
        case 'close':
            return <svg xmlns="http://www.w3.org/2000/svg" width={props.width} height={props.height} viewBox="0 0 52 52"><path fill={props.color} d="m31 25.4l13-13.1c0.6-0.6 0.6-1.5 0-2.1l-2-2.1c-0.6-0.6-1.5-0.6-2.1 0l-13.1 13.1c-0.4 0.4-1 0.4-1.4 0l-13.1-13.2c-0.6-0.6-1.5-0.6-2.1 0l-2.1 2.1c-0.6 0.6-0.6 1.5 0 2.1l13.1 13.1c0.4 0.4 0.4 1 0 1.4l-13.2 13.2c-0.6 0.6-0.6 1.5 0 2.1l2.1 2.1c0.6 0.6 1.5 0.6 2.1 0l13.1-13.1c0.4-0.4 1-0.4 1.4 0l13.1 13.1c0.6 0.6 1.5 0.6 2.1 0l2.1-2.1c0.6-0.6 0.6-1.5 0-2.1l-13-13.1c-0.4-0.4-0.4-1 0-1.4z"></path></svg>;
        case 'user':
            return <svg xmlns="http://www.w3.org/2000/svg" width={props.width} height={props.height} viewBox="0 0 52 52"><path fill={props.color} d="m50 43v2.2c0 2.6-2.2 4.8-4.8 4.8h-38.4c-2.6 0-4.8-2.2-4.8-4.8v-2.2c0-5.8 6.8-9.4 13.2-12.2l0.6-0.3c0.5-0.2 1-0.2 1.5 0.1 2.6 1.7 5.5 2.6 8.6 2.6s6.1-1 8.6-2.6c0.5-0.3 1-0.3 1.5-0.1l0.6 0.3c6.6 2.8 13.4 6.3 13.4 12.2z m-24-41c6.6 0 11.9 5.9 11.9 13.2s-5.3 13.2-11.9 13.2-11.9-5.9-11.9-13.2 5.3-13.2 11.9-13.2z"></path></svg>;
        case 'check':
            return <svg xmlns="http://www.w3.org/2000/svg" width={props.width} height={props.height} viewBox="0 0 24 24"><path fill={props.color} d="M8.8 19.6L1.2 12c-.3-.3-.3-.8 0-1.1l1-1c.3-.3.8-.3 1 0L9 15.7c.1.2.5.2.6 0L20.9 4.4c.2-.3.7-.3 1 0l1 1c.3.3.3.7 0 1L9.8 19.6c-.2.3-.7.3-1 0z"></path></svg>;
        case 'arrowdown':
            return <svg xmlns="http://www.w3.org/2000/svg" width={props.width} height={props.height} viewBox="0 0 52 52"><path fill={props.color} d="m9.6 31c-0.8 0.8-0.8 1.9 0 2.7l15 14.7c0.8 0.8 2 0.8 2.8 0l15.1-14.7c0.8-0.8 0.8-1.9 0-2.7l-2.8-2.7c-0.8-0.8-2-0.8-2.8 0l-4.7 4.6c-0.8 0.8-2.2 0.3-2.2-0.9v-27c0-1-0.9-2-2-2h-4c-1.1 0-2 1.1-2 2v27c0 1.2-1.4 1.7-2.2 0.9l-4.7-4.6c-0.8-0.8-2-0.8-2.8 0l-2.7 2.7z"></path></svg>;
        case 'forward':
            return <svg xmlns="http://www.w3.org/2000/svg" width={props.width} height={props.height} viewBox="0 0 52 52"><path fill={props.color} d="m3.4 29h33.2c0.9 0 1.3 1.1 0.7 1.7l-9.6 9.6c-0.6 0.6-0.6 1.5 0 2.1l2.2 2.2c0.6 0.6 1.5 0.6 2.1 0l17.5-17.6c0.6-0.6 0.6-1.5 0-2.1l-17.5-17.5c-0.6-0.6-1.5-0.6-2.1 0l-2.1 2.1c-0.6 0.6-0.6 1.5 0 2.1l9.6 9.6c0.6 0.7 0.2 1.8-0.7 1.8h-33.2c-0.8 0-1.5 0.6-1.5 1.4v3c0 0.8 0.6 1.6 1.4 1.6z"></path></svg>;
        default:
            return null;
    }
};
 
export default icon;