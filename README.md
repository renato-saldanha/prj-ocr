# Projeto Leitor de PDF em Node.js

Este projeto lê um arquivo PDF e extrai o texto contido nele usando a biblioteca `pdf-parse`.

## Instalação

1. Clone este repositório ou copie os arquivos para uma pasta.
2. Instale as dependências:
   ```bash
   npm install
   ```

## Uso

Coloque o arquivo PDF que deseja ler na mesma pasta do projeto (ou informe o caminho completo).

Execute o comando:

```bash
node index.js <caminho-do-arquivo.pdf>
```

Exemplo:

```bash
node index.js exemplo.pdf
```

O texto extraído será exibido no console. 