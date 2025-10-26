/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/purchase_order.json`.
 */
export type PurchaseOrder = {
  "address": "EdyLMn3iUrF16Z4VPyTfv9hC9G7eqxsHQVxnsNcsAT3Z",
  "metadata": {
    "name": "purchaseOrder",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "SRWA Purchase Order - On-chain purchase requests for SRWA tokens"
  },
  "instructions": [
    {
      "name": "approvePurchaseOrder",
      "docs": [
        "Admin aprova a purchase order e transfere os tokens"
      ],
      "discriminator": [
        169,
        230,
        32,
        46,
        180,
        165,
        71,
        7
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "purchaseOrder",
          "docs": [
            "Purchase order sendo aprovada"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  117,
                  114,
                  99,
                  104,
                  97,
                  115,
                  101,
                  95,
                  111,
                  114,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "purchase_order.mint",
                "account": "purchaseOrder"
              },
              {
                "kind": "account",
                "path": "purchase_order.investor",
                "account": "purchaseOrder"
              },
              {
                "kind": "account",
                "path": "purchase_order.created_at",
                "account": "purchaseOrder"
              }
            ]
          }
        },
        {
          "name": "adminTokenAccount",
          "docs": [
            "Token account do admin (origem dos tokens)"
          ],
          "writable": true
        },
        {
          "name": "investorTokenAccount",
          "docs": [
            "Token account do investor (destino dos tokens)"
          ],
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "cancelPurchaseOrder",
      "docs": [
        "Investor cancela purchase order pendente (reembolso automático)"
      ],
      "discriminator": [
        5,
        234,
        20,
        31,
        5,
        88,
        90,
        219
      ],
      "accounts": [
        {
          "name": "investor",
          "writable": true,
          "signer": true
        },
        {
          "name": "purchaseOrder",
          "docs": [
            "Purchase order sendo cancelada"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  117,
                  114,
                  99,
                  104,
                  97,
                  115,
                  101,
                  95,
                  111,
                  114,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "purchase_order.mint",
                "account": "purchaseOrder"
              },
              {
                "kind": "account",
                "path": "purchase_order.investor",
                "account": "purchaseOrder"
              },
              {
                "kind": "account",
                "path": "purchase_order.created_at",
                "account": "purchaseOrder"
              }
            ]
          }
        },
        {
          "name": "adminVault",
          "docs": [
            "Vault do admin que retornará o SOL"
          ],
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createPurchaseOrder",
      "docs": [
        "Cria uma nova purchase order (investor envia SOL, espera aprovação do admin)"
      ],
      "discriminator": [
        149,
        194,
        73,
        182,
        117,
        192,
        79,
        74
      ],
      "accounts": [
        {
          "name": "investor",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "docs": [
            "Mint do token SRWA sendo comprado"
          ]
        },
        {
          "name": "purchaseOrder",
          "docs": [
            "PDA da purchase order",
            "Derivado de: [b\"purchase_order\", mint, investor, timestamp]"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  117,
                  114,
                  99,
                  104,
                  97,
                  115,
                  101,
                  95,
                  111,
                  114,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "investor"
              },
              {
                "kind": "arg",
                "path": "timestamp"
              }
            ]
          }
        },
        {
          "name": "adminVault",
          "docs": [
            "Vault do admin que receberá o SOL"
          ],
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "quantity",
          "type": "u64"
        },
        {
          "name": "pricePerTokenLamports",
          "type": "u64"
        },
        {
          "name": "timestamp",
          "type": "i64"
        }
      ]
    },
    {
      "name": "rejectPurchaseOrder",
      "docs": [
        "Admin rejeita a purchase order e reembolsa o SOL"
      ],
      "discriminator": [
        153,
        105,
        254,
        247,
        117,
        186,
        95,
        24
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "purchaseOrder",
          "docs": [
            "Purchase order sendo rejeitada"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  117,
                  114,
                  99,
                  104,
                  97,
                  115,
                  101,
                  95,
                  111,
                  114,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "purchase_order.mint",
                "account": "purchaseOrder"
              },
              {
                "kind": "account",
                "path": "purchase_order.investor",
                "account": "purchaseOrder"
              },
              {
                "kind": "account",
                "path": "purchase_order.created_at",
                "account": "purchaseOrder"
              }
            ]
          }
        },
        {
          "name": "adminVault",
          "docs": [
            "Vault do admin que retornará o SOL"
          ],
          "writable": true
        },
        {
          "name": "investor",
          "docs": [
            "Investor que receberá o reembolso"
          ],
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "reason",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "purchaseOrder",
      "discriminator": [
        54,
        162,
        145,
        43,
        249,
        114,
        171,
        23
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "alreadyProcessed",
      "msg": "Purchase order já foi processada"
    },
    {
      "code": 6001,
      "name": "notPending",
      "msg": "Purchase order não está pendente"
    },
    {
      "code": 6002,
      "name": "invalidQuantity",
      "msg": "Quantidade inválida (deve ser > 0)"
    },
    {
      "code": 6003,
      "name": "invalidPrice",
      "msg": "Preço inválido (deve ser > 0)"
    },
    {
      "code": 6004,
      "name": "unauthorizedCancel",
      "msg": "Apenas o investor pode cancelar"
    },
    {
      "code": 6005,
      "name": "unauthorizedAdmin",
      "msg": "Apenas admin pode aprovar/rejeitar"
    },
    {
      "code": 6006,
      "name": "insufficientAdminTokens",
      "msg": "Saldo insuficiente de tokens do admin"
    },
    {
      "code": 6007,
      "name": "rejectReasonTooLong",
      "msg": "Motivo de rejeição muito longo (max 200 chars)"
    },
    {
      "code": 6008,
      "name": "mathOverflow",
      "msg": "Overflow no cálculo do total"
    }
  ],
  "types": [
    {
      "name": "purchaseOrder",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "Bump seed para o PDA"
            ],
            "type": "u8"
          },
          {
            "name": "investor",
            "docs": [
              "Investor que está comprando"
            ],
            "type": "pubkey"
          },
          {
            "name": "mint",
            "docs": [
              "Mint do token SRWA sendo comprado"
            ],
            "type": "pubkey"
          },
          {
            "name": "quantity",
            "docs": [
              "Quantidade de tokens solicitados (em unidades base)"
            ],
            "type": "u64"
          },
          {
            "name": "pricePerTokenLamports",
            "docs": [
              "Preço por token em lamports"
            ],
            "type": "u64"
          },
          {
            "name": "totalLamports",
            "docs": [
              "Total em SOL (lamports) que o investor pagou"
            ],
            "type": "u64"
          },
          {
            "name": "status",
            "docs": [
              "Status da purchase order"
            ],
            "type": {
              "defined": {
                "name": "purchaseOrderStatus"
              }
            }
          },
          {
            "name": "createdAt",
            "docs": [
              "Timestamp de criação"
            ],
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "docs": [
              "Timestamp de atualização"
            ],
            "type": "i64"
          },
          {
            "name": "processedBy",
            "docs": [
              "Admin que aprovou/rejeitou (se aplicável)"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "approvalTx",
            "docs": [
              "Transaction signature da aprovação (se aprovado)"
            ],
            "type": {
              "option": {
                "array": [
                  "u8",
                  64
                ]
              }
            }
          },
          {
            "name": "rejectReason",
            "docs": [
              "Motivo da rejeição (se rejeitado)"
            ],
            "type": {
              "option": "string"
            }
          }
        ]
      }
    },
    {
      "name": "purchaseOrderStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "approved"
          },
          {
            "name": "rejected"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    }
  ]
};
