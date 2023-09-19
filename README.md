# Back-end

## Configuração do Back-end

1. Baixe o ZIP do projeto ou clone o respositório

2. Abra o projeto no Visual Studio Code (VSCode).

3. No terminal do VSCode, execute o seguinte comando para instalar as dependências necessárias:

```bash
yarn 
```

4. Renomeie o arquivo `.env.example` para `.env`.

5. Dentro do arquivo `.env`, defina as seguintes variáveis de ambiente:

```dotenv
DATABASE_URL="file:./dev/db"
JWT_SECRET="7DB8A5174EA1633DEB6D4C28A43A3"
```

## Executando o Back-end

6. No terminal do VSCode, execute o seguinte comando para criar a estrutura do banco de dados:

```bash
npx prisma migrate dev --name init 
```

7. Em seguida, execute o seguinte comando para iniciar o back-end:

```bash
yarn dev
```


8. O projeto do back-end estará rodando na porta 3030 do seu localhost.

## Teste de Autenticação

De acordo com os requisitos do teste, a tela de criação de usuário deve ser redirecionada para a tela de usuários (para isso acontecer é necessário estar autenticado em alguma conta obrigatoriamente). Para facilitar o teste, foi criada uma conta de teste para a FCx Labs. Ao abrir a tela de login (Front-end), informe as seguintes credenciais:

- **Login:** fcxlabs12
- **Senha:** fcx@123

Se você tiver alguma dúvida ou encontrar problemas, não hesite em entrar em contato. 🚀👩‍💻
