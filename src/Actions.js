const ACTIONS = {
    CONNECTION: 'connection',
    MESSAGE:'message',
    JOINROOM: 'joinRoom',
    JOINED: 'joined',
    DISCONNECTED: 'disconnected',
    CODE_CHANGE: 'code-change',
    SYNC_CODE_CLIENT: 'sync-code-client',
    SYNC_CODE_SERVER: 'sync-code-server',
    CLIENTS: 'clients-inside-room',
    LEAVE: 'leave',
    PASTMESSAGES: 'handle-past-messages',
    DISCONNECT: 'disconnect',
    LEFT: 'left',
    JOIN_SUB_ROOM: 'join-sub-room',
    SEND_CODE_TO_SERVER: "send-code-server",
    SEND_CODE_TO_CLIENT: "send-code-client"

};

module.exports = ACTIONS;