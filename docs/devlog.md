Devlog — Generative motion study

# 23/12 - Fase 1

Today I decided to stop.
Not because the project is done, but because too many things started to happen at the same time. Particles, text, interaction, layout, effects — everything was working, but it felt noisy.
I realised I enjoy exploring ideas, but I also need to understand what I’m building. Freezing this version to create a pause.
This project is teaching me that experimentation is important, but structure is what allows experimentation to continue without becoming chaos.
I’m leaving this version here as it is — stable, imperfect, and honest.

# 23/12 - Fase 2

Perdi imenso tempo a tentar dar refactor e o efeito visual piorou em relação à versão anterior... honestamente sinto que fiz zero progressos. Tentei perceber a particula a um nivel fisico e apercebi-me a meio que para criação de UI / efeitos visuais as vezes física complexa nao é a melhor opção. O modelo neste momento está divido entre física e visual. "physicalUpdate" com base na velocidade e "update" com base num alvo/posição (visual). Efeito smooth / lerp é muito mais "bonito" se fizer o update visual mas não é física...
Estudei conceitos tipo damping, spring, etc.. o que significam entre si como se relacionam entre si e como influenciam as particulas, mas probably estou a utiliza-los sem saber realmente o porquê.
Mais projeto "estudo" do que propriamente avanço técnico.
Proxima versão => refatorada e bem divida (talvez esquecer a física e focar me num UI calmo)

# 24/12 - Fase 3

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

Energia (jitter / noise / flow)
tenta tirar a partícula do sítio
quanto maior → mais ela se afasta
é a fonte do movimento

Força (strength do radialField)
tenta trazer a partícula de volta
quanto maior → retorno mais rápido
é o “elástico”

Damping
mata velocidade ao longo do tempo
quanto mais alto → movimento morre rápido
controla “quão viva” a coisa parece

# 25/12 - Fase 4

Mais uma vez, tudo escalou e em vez de simplificar, compliquei.

Sempre que tento "organizar" as coisas acabo por me perder e o que começou com uma tentativa de simplicação acabou por se tornar algo chato e complicado. Comecei a questionar cada função em "dynamics": "porquê este parâmetro?" "qual a escala real deste valor?" "isto vai de 0 a 1? de -1 a 1? de 0 a 100?".
Os chamados “números mágicos” começaram a irritar-me profundamente. Fazer debug tornou-se exaustivo porque eu própria já não tinha uma percepção clara de qual era a unidade mental de cada função. Foi então que nasceu a ideia de um contracto. A noção de engine contract não surgiu por vaidade nem por ambição de framework, mas por necessidade: eu precisava de um padrão que me permitisse olhar para uma função e saber imediatamente em que espaço ela opera, quais são as suas unidades e que tipo de efeito produz. A escolha de wavelength como unidade de escala espacial veio exatamente daí — não porque seja “mais correta”, mas porque é mais compreensível conceptualmente do que um número arbitrário entre 0 e 1. Sim, provavelmente é overkill. Mas foi overkill por frustração.
Durante este processo tornou-se também evidente que o ficheiro dynamics estava a concentrar demasiados conceitos diferentes. Havia uma mistura constante entre: lógica física e lógica visual. Como resposta a isso, dissolvi dynamics em dois ficheiros distintos: physics e visuals. Não porque o sistema “precisasse”, mas porque eu precisava dessa separação para voltar a pensar com clareza. O problema é que esta minha necessidade de compreender tudo de forma exaustiva fez-me descer vários níveis conceptuais de uma vez. Ao questionar tudo com tanta rigidez, acabei por atrasar o processo e afastar-me do objetivo inicial. Neste momento já nem sei se tudo faz sentido do ponto de vista prático... enfim. Finalmente introduzi delta time real no sistema. Isso resolve um problema estrutural antigo e traz consistência entre máquinas, mesmo que o custo cognitivo tenha sido alto.
Neste ponto, tornou-se claro que o projeto já não é uma coisa só. A landing page e o estudo de motion estão a puxar em direções diferentes. Para evitar que isto continue a escalar indefinidamente, comecei a ponderar extrair a landing page para um projeto separado. No entanto, o código ainda está demasiado misturado para que essa separação seja feita de forma limpa. Por agora, este repositório continua a ser o espaço de trabalho onde essa separação está a ser explorada e clarificada. A extração só acontecerá quando o background visual e a estrutura estiverem suficientemente estáveis para se sustentarem por si.

# 29/12 - Fase 5

Hoje o foco foi fazer sentido da classe Effect.

Eu queria uma classe “mãe” que fosse um ponto de orientação comum para todos os efeitos. Algo simples, explícito, que evitasse repetição e me ajudasse a manter um raciocínio consistente ao criar efeitos novos. A ideia, no fundo, é tratar funções como ingredientes e os efeitos como receitas. Cada função deve ser pura, reutilizável e conceptualmente clara — nada de lógica inventada localmente só para “fazer funcionar”. Paralelamente, senti necessidade de ter não só ingredientes, mas também regras de fluxo: uma ordem mental que me diga como pensar num efeito, mesmo antes de o escrever.
Ao rever o código, tornou-se óbvio que ainda estava a misturar demasiados conceitos físicos com visuais. Mesmo o flow que tinha definido na fase 3 estava muito ancorado em teoria física, quando muitos dos efeitos que quero explorar são essencialmente visuais. Em suma, existem dois regimes distintos de movimento, e tentar forçá-los a passar pelo mesmo caminho estava a criar confusão desnecessária.
No regime físico, o estado da partícula é posição + velocidade. O movimento emerge de forças, passa por integração temporal real (dt) e sofre damping. No regime visual, o estado é essencialmente posição: o movimento é um deslocamento artístico guiado por intenção, sem integração clássica nem conservação de energia real. O “commit” do estado é imediato e o controlo da energia é perceptivo, não físico.
Apesar disso, ambos os regimes partilham muita coisa: partículas, fields como fonte de intenção, constraints espaciais e o mesmo sistema de render. A diferença não está no início nem no fim do pipeline, mas no meio. Em vez de tentar unificar tudo à força, passei a pensar num fluxo comum com bifurcação consciente:

Input / intenção → aplicação de movimento (física ou visual) → commit de estado → perda de energia (quando existe) → constraints → render.

O objetivo deste refactor é claro: eliminar código repetido dentro dos efeitos, remover funções locais sem significado geral e concentrar toda a lógica reutilizável em ingredientes explícitos, organizados por responsabilidade (fields, motion, constraints, render). Os efeitos deixam de ser mini-sistemas e passam a ser combinações conscientes desses blocos, o que abre espaço para mais experimentação com menos fricção cognitiva.
Este refactor é uma migração progressiva. A prioridade é manter tudo funcional enquanto o modelo se alinha com esta linguagem mínima. Separar alhos de bugalhos, aceitar que há coisas comuns aos dois regimes, mas que aplicação define o comportamento.

# 31/12 - Fase 6

Perdi um dia inteiro a lutar contra a arquitetura

Nesta fase percebi que estava a tentar forçar o Canvas 2D a fazer algo que, conceptualmente, não lhe pertence — mas isto só ficou claro no fim. No início, eu não tinha essa consciência.
Tudo começou com uma intenção simples: queria fumo realista. Fumo move-se, dissolve-se, deixa rasto. Parecia um objetivo razoável, e partículas pareceram imediatamente a escolha certa. São discretas, têm estado, deixam rasto — tudo isto parecia alinhar-se com a ideia de fumo.
Passei um dia inteiro a tentar fazer isso funcionar. Ajustei parâmetros, mudei forças, adicionei blur, acumulação, tentei variações do mesmo sistema. O resultado nunca era convincente. Ou surgiam riscos visíveis, ou bolas desfocadas, ou blobs de fumo que não pareciam naturais. Tecnicamente, as coisas estavam “a funcionar”, mas visualmente não.
A certa altura tive de parar e perguntar: porque é que isto nunca parece fumo?
Foi aí que percebi o erro fundamental. O fumo não deixa rasto como uma linha, nem como um objeto que passou ali, nem como uma memória discreta. O fumo deixa densidade residual, que é transportada, difundida e dissipada em todo o espaço, de forma contínua. O rasto do fumo não é a passagem de entidades — é o próprio campo a persistir no tempo.
Percebi então que estava a tentar representar um campo contínuo com partículas discretas. O problema não era a implementação, era o modelo mental. O que eu queria construir simplesmente não se alinhava com partículas. Aceitei que fumo realista, naquela abordagem e naquela arquitetura, não era possível.
Em vez de insistir, mudei de ideias e tentei água. Água parecia ter uma “base”, uma superfície que eu podia distorcer. A ideia passou a ser criar uma imagem procedural com noise e fazê-la mover-se de forma fluida. Foi aqui que comecei a trabalhar mais a sério com fBm e a aprender o conceito de domain warping.
No início achei que estava a fazer advection. Criava um noise, depois outro noise, e tentava usar um para distorcer o outro. Mas algo nunca batia certo. A imagem parecia sempre uma sequência de frames diferentes, mesmo quando era o mesmo campo. Não havia continuidade real. A imagem não “arrastava” a imagem anterior.
Só mais tarde percebi o porquê: passar o tempo como parâmetro no noise não cria movimento real. Apenas descreve a evolução de um campo. Não há transporte, não há memória. Foi aqui que o conceito de advection ficou claro para mim: advection não é “noise animado”, é transportar valores ao longo de um campo de velocidades, algo que exige feedback entre frames.
A partir daí, comecei a tratar o efeito como aquilo que ele realmente era: um mini fragment shader em CPU. Um campo contínuo avaliado por pixel, com fBm, domain warping, iluminação fake e paletas interpoladas. Finalmente havia coerência, suavidade e uma sensação clara de movimento. Mas também ficou evidente outro limite: este tipo de abordagem era caro demais para a arquitetura de Canvas 2D.
Foi neste ponto que tudo se alinhou. Canvas 2D e fragment shaders resolvem problemas diferentes. Insistir na ferramenta errada só gera frustração e complexidade desnecessária. Aceitei essas limitações e ajustei o objetivo. Em vez de fumo ou água física, construí fundos animados baseados em campos contínuos. Não há advection real, não há transporte de densidade — é o campo a ser alterado no tempo. Mas o resultado é visualmente coerente e adequado à ferramenta.
O SmokeEffect fica em pausa por agora. Antes de o tentar novamente, quero compreender melhor shaders e advection real.
Esta fase foi fundamental para separar mentalmente efeitos baseados em entidades de efeitos baseados em campos contínuos, e para perceber quando faz mais sentido mudar de abordagem em vez de lutar contra a arquitetura.
