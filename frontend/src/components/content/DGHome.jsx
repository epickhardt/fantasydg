import React, { memo } from "react"

function BadgerChatHome () {
    return <>
        <h1>Welcome to Fantasy Disc Golf!</h1>
        <p>Running on {process.env.NODE_ENV}</p>
        <p>Register or Login to get started</p>
        <p>More information can be found in the Rules tab</p>
    </>
}

export default memo(BadgerChatHome);