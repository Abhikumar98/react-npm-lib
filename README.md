# Dakiya SDK

Send messages on chain to any ethereum address.

## Usage

```
npm i @dakiya/sdk

or

yarn add @dakiya/sdk

```

## Steps

1. On board user before sending messages

```
import { onboardUser } from "@dakiya/sdk";

const App = () => {

    const handleOnBoard = async () => {

        const account = ""; // current connected account from metamask
        const chainId = "0x1"' // current chain id from metamask

        const user = await onboardUser(account, chainId);
        console.log(user);
    }

    return <button onClick={handleOnBoard}>Let's get started</button>
}

```

2. Start sending messages :)

```
import { createThread } from "@dakiya/sdk";

const App = () => {

    const startNewThread = async () => {

        const createThreadParams = {
            receiver: "someone.eth"
            subject: "Hello world !";
            message: "Basic hello";
            chainId: "0x1";
        }

        const newThread = await createThread(createThreadParams);
    }

    return <button onClick={startNewThread}>Say Hello</button>
}

```

3. Start sending messages :)

```
import { threadReply } from "@dakiya/sdk";

const App = () => {

    const startNewThread = async () => {

        const threadReplyParams = {
            receiver: "",
            message: "",
            threadId: "",
            encryptionKey: "", // thread's encryption key
            senderPubEncKey: "0x...", // sender's public encryption key
            receiverPubEncKey: "", // reciever's public encryption key
            encrypt: true, // is thread encrypted?
            chainId: "0x1"
        }

        /**
        encryptionKey, senderPubEncKey, receiverPubEncKey, encrypt are supposed to be passed from the thread details when decrypted while loading the thread
        */

        const newThread = await createThread(threadReplyParams);
    }

    return <button onClick={startNewThread}>Say Hello</button>
}

```

4. Fetching messages from thread

```
import { getMessagesFromThread } from "@dakiya/sdk";

const App = () => {

    const fetchMessages = async () => {

        const getMessagesParams = {
            account: "", // current connected account from metamask
            threadId: "",
            encryptionKey: "", // thread's encryption key
            chainId: "0x1"
        }

        const newThread = await getMessagesFromThread(getMessagesParams);
    }

    return <button onClick={fetchMessages}>Say Hello</button>
}
```

5. Getting subject of Thread while getting messages

```
import { getSubject } from "@dakiya/sdk";

const App = () => {

    const fetchThreadSubject = async () => {

        const subjectParams = {
            subjectURI: "", // thread's encryption key
            encryptionKey: ""
        }

        const newThread = await getSubject(subjectParams);
    }

    return <button onClick={fetchThreadSubject}>Say Hello</button>
}
```
