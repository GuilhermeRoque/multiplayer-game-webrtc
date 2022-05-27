# Especificações
## Requisições de usuários
### Autenticação
- Descrição: Usuário envia sua identificação para o servidor que irá validar e responder com um token que deverá ser incluído nas próximas requisições.
- Ex. requisição:
    ```
    {
        "method": "authenticate",
        "value": {
            name: "guilherme_roque",
            password: "123456"
            },
    }

    ```
- Resposata de sucesso:
    ```
    {
        "status": 200,
        "message": "successful authentication"
        "value": "AGU5312635GJSAOJ212"
    }

    ```
- Credenciais inválidas:
    ```
    {
        "status": 400,
        "message": "invalid credentials"
        "value": "guilherme_roque"
    }

    ```

### Criar sala
- Descrição: Usuário envia uma requisição para o servidor criar uma sala onde outros usuários podem posteriormente ingressar.
- Ex. requisição:
    ```
    {
        "auth": "AGU5312635GJSAOJ212",
        "method": "create_room",
        "value": {
            "name": "my_room",
            "allowed_users": [],
            "private": False,
        },
    }

    ```
    - Notas: 
    - 'allowed_users' define uma lista prévia de jogadores autorizados; 
    - 'private' define se mais algum jogador pode requisitar entrada além dos especificados em "allowed_users";
    - se o 'allowed_users' estiver vazio qualquer jogador poderá ingressar na sala
- Resposata de sucesso:
    ```
    {
        "status": 200,
        "message": "room created"
    }

    ```
- Usuário já possui sala criada:
    ```
    {
        "status": 400,
        "message": "room already exists"
        "value": "my_room"
    }

    ```
### Entrar em sala
- Descrição: O usuário irá requisitar entrar em uma sala. Se o mesmo já estiver incluído na lista de usuários permitidos será retorna uma mensagem de sucesso caso contrário será enviado uma notificação para o usuário dono da sala.

- Ex. requisição:
    ```
    {
        "auth": "AGU5312635GJSAOJ212",
        "method": "join_room",
        "value": {
            "name": "other_user_room",
        },
    }

    ```

- Resposata de sucesso:
    ```
    {
        "status": 200,
        "message": "joined successfully"
    }

    ```
- Resposata de negação por sala privativa:
    ```
    {
        "status": 403,
        "message": "this is a private room"
    }

    ```
- Resposata de negação por sala lotada:
    ```
    {
        "status": 400,
        "message": "this room has reached the users limit"
    }

    ```

### Convidar usuário para sala
- Descrição: O usuário irá requisitar entrar em uma sala. Se o mesmo já estiver incluído na lista de usuários permitidos será retorna uma mensagem de sucesso caso contrário será enviado uma notificação para o usuário dono da sala.

- Ex. requisição:
    ```
    {
        "auth": "AGU5312635GJSAOJ212",
        "method": "invite_room",
        "value": {
            "user": "other_user",
        },
    }

    ```

- Resposata de sucesso:
    ```
    {
        "status": 200,
        "message": "invite sent"
    }

    ```

### Sair da sala
- Descrição: O usuário irá notificar a saída de uma sala.

- Ex. requisição:
    ```
    {
        "auth": "AGU5312635GJSAOJ212",
        "method": "leave_room",
        "value": {
            "name": "other_user_room",
        },
    }

    ```

- Resposata de sucesso:
    ```
    {
        "status": 200,
        "message": "notification sent"
    }

    ```

### Ofertar configuração de mídia
- Descrição: O usuário irá ofertar uma configuração de mída

- Ex. requisição:
    ```
    {
        "auth": "AGU5312635GJSAOJ212",
        "method": "media_settings",
        "value": {},
    }

    ```

- Resposata de sucesso:
    ```
    {
        "status": 202,
        "message": "Accepted"
    }

    ```
- Resposata de falha (não suportado):
    ```
    {
        "status": 400,
        "message": "Media configuration not supported"
    }

    ```

### Mensages padrão
    ```
    {
        "status": 500,
        "message": "the server could not execut the request due to internal errors"
        "value": ""
    }

    ```
