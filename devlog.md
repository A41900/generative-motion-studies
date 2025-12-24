Devlog — Generative motion study

# 23/12

Today I decided to stop.
Not because the project is done, but because too many things started to happen at the same time. Particles, text, interaction, layout, effects — everything was working, but it felt noisy.
I realised I enjoy exploring ideas, but I also need to understand what I’m building. Freezing this version to create a pause.
This project is teaching me that experimentation is important, but structure is what allows experimentation to continue without becoming chaos.
I’m leaving this version here as it is — stable, imperfect, and honest.

# 23/12

Perdi imenso tempo a tentar dar refactor e o efeito visual piorou em relação à versão anterior... honestamente sinto que fiz zero progressos. Tentei perceber a particula a um nivel fisico e apercebi-me a meio que para criação de UI / efeitos visuais as vezes física complexa nao é a melhor opção. O modelo neste momento está divido entre física e visual. "physicalUpdate" com base na velocidade e "update" com base num alvo/posição (visual). Efeito smooth / lerp é muito mais "bonito" se fizer o update visual mas não é física...
Estudei conceitos tipo damping, spring, etc.. o que significam entre si como se relacionam entre si e como influenciam as particulas, mas probably estou a utiliza-los sem saber realmente o porquê.
Mais projeto "estudo" do que propriamente avanço técnico.
Proxima versão => refatorada e bem divida (talvez esquecer a física e focar me num UI calmo)

# 24/12

Entusiasmada com as minhas alterações!!!

Hoje percebi que o problema não era o código estar “mal”, mas eu não saber explicar o que estava a acontecer dentro dele.
O refactor anterior fez o efeito visual piorar e isso foi frustrante, mas acabou por ser essencial. Em vez de tentar melhorar a estética, fui ao núcleo da coisa: o que é uma partícula, afinal?
Decidi criar uma partícula atómica e neutra. Não sabe o que é um efeito, não sabe o que é mouse, não sabe para onde ir. Só guarda estado (posição, velocidade,radius) e sabe integrar forças. Toda a inteligência sai da partícula.
Aqui há um big conceptual leap = criei um conjunto de regras em separado (dynamics): campos, forças, impulsos, constraints. Nada se mexe sozinho. Tudo é explícito. Cada função faz uma coisa só.
Chegar a esta conclusão de motion/dynamics foi díficil, antes eu estava a criar "mini-side-effects" para criar o efeito final. Cada pequeno efeito que criava causava mais confusão, por exemplo cheguei a ter todos estes efeitos: "repelForce", "repelVisual", "mouseDeflectionVisual", "attractVisual" sem chegar ao conceito final que são todos derivações da mesma coisa: um "radialFiel" com uma força/constraint aplicada. Estes são os melhores exemplos porque literalmente faziam o mesmo de maneiras diferentes, e implementações diferentes eram necessárias na versão anterior devido à maneira como a particula se movia. Also, devido ao facto da particula "saber" o que estava a fazer. Existia uma sobreposição constante de conceitos, o que me levava a criar soluções muito específicas para problemas muito locais. A grande mudança foi perceber que a ideia de dynamics não precisava de estar acoplada a nenhum efeito concreto. Ao isolá-la como uma camada independente — válida tanto para estudos de movimento como para jogos ou efeitos visuais — ganhei uma clareza que antes não existia, e passei a conseguir pensar o sistema de forma mais global.

Podemos dizer que cheguei a um flow básico no update para cada efeito (que pode ser integrado em outras situaçoes):

1. INPUT / INTENÇÃO (opcional)
2. FORCES (aceleração)
3. INTEGRATION (commit do frame)
4. DAMPING (perda de energia)
5. CONSTRAINTS (regras)
6. RENDER (fora do update)

KEY POINT (cheat): Fields dizem “para onde”; Forces dizem “quanto”; Integrate diz “agora”; Damp diz “quanto sobra” e Constraints dizem “não podes”.
O projeto inicialmente que era uma landing page passou a ser um estudo sobre como estruturar objetivamente um conceito abstrato sem entrar em rabbit holes, manter a estrutura, compreender a física, dividir e modularizar as funções para serem usadas depois.
