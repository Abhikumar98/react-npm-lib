export default [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'uri',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'thread_id',
        type: 'uint256',
      },
    ],
    name: 'MessageSent',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'thread_id',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: '_sender_key',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: '_receiver_key',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: '_encrypted',
        type: 'bool',
      },
    ],
    name: 'ThreadCreated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'checkUserRegistration',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'receiver', type: 'address' }],
    name: 'getPubEncKeys',
    outputs: [
      {
        internalType: 'string',
        name: 'sender_key',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'receiver_key',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_thread_id',
        type: 'uint256',
      },
      { internalType: 'string', name: '_uri', type: 'string' },
      {
        internalType: 'address',
        name: '_receiver',
        type: 'address',
      },
      {
        internalType: 'string',
        name: '_sender_key',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_receiver_key',
        type: 'string',
      },
      { internalType: 'bool', name: 'encrypted', type: 'bool' },
    ],
    name: 'sendMessage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'encKey', type: 'string' }],
    name: 'setPubEncKey',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'threadCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];
