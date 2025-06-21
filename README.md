João Vitor Correa Oliveira
Eduardo Henrique Fabri

# 🥊 Boxing Clash: Final Round

Um jogo de boxe interativo desenvolvido em React/Next.js com gráficos em p5.js, sistema de som avançado e múltiplos níveis de dificuldade.

## 🎯 Visão Geral


- ⚔️ Sistema de combate com diferentes tipos de golpes
- 🎵 Sistema de som completo com música original "Eye of the Tiger"
- 🎮 4 níveis de dificuldade (Iniciante, Intermediário, Difícil, Lendário)
- 🏆 Sistema de pontuação e rounds
- 🎨 Interface moderna com animações fluidas
- 📱 Design responsivo

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Estilização
- **p5.js** - Gráficos e animações do jogo
- **React P5** - Integração p5.js com React

### UI Components
- **Radix UI** - Componentes base
- **Lucide React** - Ícones
- **shadcn/ui** - Sistema de design

### Audio
- **Web Audio API** - Sistema de som
- **HTML5 Audio** - Reprodução de música

### Desenvolvimento
- **ESLint** - Linting
- **PostCSS** - Processamento CSS
- **Autoprefixer** - Compatibilidade CSS

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn** ou **pnpm**
- **Git**

### Verificar versões
```bash
node --version  # v18+
npm --version   # v8+
```

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd boxing
```

### 2. Instale as dependências
```bash
# Com npm
npm install

# Com yarn
yarn install

# Com pnpm
pnpm install
```

### 3. Verifique os arquivos de áudio
Certifique-se de que o arquivo de música está presente:
```
public/Survivor-EyeOfTheTigermp3-codes1.com_64kb.mp3
```

## 🎮 Como Executar

### Desenvolvimento
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

O jogo estará disponível em: `http://localhost:3000`

### Build de Produção
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

## 📁 Estrutura do Projeto

```
boxing/
├── app/                          # App Router (Next.js 13+)
│   ├── globals.css              # Estilos globais
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Página principal
├── components/                   # Componentes React
│   ├── ui/                      # Componentes base (shadcn/ui)
│   ├── About.tsx                # Tela sobre
│   ├── BackgroundRenderer.ts    # Renderização do fundo
│   ├── DifficultySelector.tsx   # Seletor de dificuldade
│   ├── GameComponentNew.tsx     # Componente principal do jogo
│   ├── GameOver.tsx             # Tela de fim de jogo
│   ├── HUD.ts                   # Interface do jogo
│   ├── Instructions.tsx         # Instruções
│   ├── Menu.tsx                 # Menu principal
│   ├── NicknameInput.tsx        # Input de nickname
│   ├── ParticleSystem.ts        # Sistema de partículas
│   ├── SoundControls.tsx        # Controles de som
│   └── SoundManager.ts          # Gerenciador de som
├── public/                       # Arquivos estáticos
│   ├── *.png                    # Imagens do jogo
│   └── *.mp3                    # Arquivo de música
├── styles/                       # Estilos adicionais
├── package.json                  # Dependências e scripts
├── next.config.mjs              # Configuração Next.js
├── tailwind.config.ts           # Configuração TailwindCSS
└── tsconfig.json                # Configuração TypeScript
```


## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.


