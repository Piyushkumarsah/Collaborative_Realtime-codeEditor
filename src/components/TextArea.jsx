import React, { useEffect, useRef } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

export default function TextArea({ roomId, userName, socket }) {
    const editorRef = useRef(null);
    const codeRef = useRef(null);
    const isSocketUpdate = useRef(false);

    useEffect(() => {
        const editor = CodeMirror.fromTextArea(editorRef.current, {
            mode: { name: 'javascript', json: true },
            theme: 'dracula',
            autoCloseTags: true,
            autoCloseBrackets: true,
            lineNumbers: true,
        });

        editor.on('change', (instance, changes) => {
            if (!isSocketUpdate.current) {
                const value = instance.getValue();
                const { orgin } = changes;
                console.log("value is :", value, changes);
                socket.emit(ACTIONS.SYNC_CODE, { roomId, value });
            }
        });

        const handleSyncCode = (code) => {
            codeRef.current = code;
            isSocketUpdate.current = true;
            editor.setValue(codeRef.current);
            isSocketUpdate.current = false;
            console.log("text received", codeRef.current);
        };

        socket.on(ACTIONS.SYNC_CODE, handleSyncCode);
        socket.on(ACTIONS.PASTMESSAGES,handleSyncCode);
        return () => {
            // Clean up CodeMirror instance when the component unmounts
            editor.toTextArea();
            // Remove the event listener
            socket.off(ACTIONS.PASTMESSAGES,handleSyncCode);
            socket.off(ACTIONS.SYNC_CODE, handleSyncCode);
        };
    }, [socket, roomId]);

    return (
        <div className='h-full w-full'>
            <textarea
                ref={editorRef}
                id='editor'
                className='h-full w-full'
            ></textarea>
        </div>
    );
}
