# Engine Contract — Units & Scales

Este documento define as unidades, escalas e responsabilidades
do motor de partículas e campos.

Nada aqui é arbitrário.
Todos os parâmetros têm significado explícito.

## 1. Unidades Fundamentais

- Posição: pixels (px)
- Distância: pixels (px)
- Tempo: segundos (s)
- Ângulos: radianos

## 2. Espaços do Motor

### A) Geométrico

- posição, distância
- independente do tempo

### B) Direcional

- vetores normalizados [-1, 1]
- sem magnitude

### C) Físico

- velocidade: px / s
- aceleração: px / s²
- integra usando dt

### D) Visual

- deslocamento artístico
- interpolação
- pode ignorar física

## 3. Field

Um Field descreve apenas uma influência direcional.

Field:

- nx ∈ [-1, 1]
- ny ∈ [-1, 1]
- strength ∈ [0, 1]

Um Field:

- NÃO move partículas
- NÃO usa dt
- NÃO conhece unidades físicas

## 4. Escalas Espaciais

Campos espaciais usam comprimento de onda (wavelengthPx):

scale = 2π / wavelengthPx

Referência visual:

- 400–800 px → variação suave
- 200–400 px → orgânico
- 80–150 px → turbulento

## 5. Conversores de Campo

### Aceleração Física

- unidade: px / s²
- intervalo típico: 10–600

### Impulso

- unidade: px / s
- intervalo típico: 20–400

### Deslocamento Visual

- unidade: px / s
- usa dt localmente

## 6. Damping

O damping usa decaimento exponencial:

factor = retention^dt

Onde:

- retention ∈ [0, 1]
- representa a fração de velocidade após 1 segundo

## 7. Regras

- Nenhuma função deve esconder dt
- Nenhuma escala deve depender de FPS
- Nenhum número deve existir sem unidade definida

/\*\*

- =======================================================
- UNIDADES E ESCALAS — REGRAS DO MOTOR
- =======================================================
-
- - Posições: pixels (px)
- - Direções: vetores normalizados [-1, 1]
- - Ângulos: radianos
-
- CAMPOS (Field):
- - NÃO movem partículas
- - NÃO usam dt
- - Apenas descrevem direção + intensidade
-
- ESCALAS ESPACIAIS:
- - Usam "wavelengthPx" (comprimento de onda em pixels)
- - scale = 2π / wavelengthPx
-
- Regra visual:
- - wavelength grande → variação suave (ondas largas)
- - wavelength pequeno → variação rápida (turbulência)
    \*/

/\*\* RADIAL FIELD

- Field (contrato de dados)
-
- nx, ny ∈ [-1, 1] → direção
- strength ∈ [0, 1] → intensidade
  \*/

/\*\*

- Campo radial centrado num ponto.
-
- PARÂMETROS:
- - radius (px):
- > 50–150 → influência local
- > 200–500 → campos amplos
-
- - direction:
- +1 → afasta do centro
- -1 → atrai para o centro
  \*/

/\*\* flowfield

- Campo de fluxo contínuo no espaço.
-
- CONTRATO:
- - Retorna Field direcional
- - Pode evoluir no tempo
- - NÃO move partículas
-
- PARÂMETROS:
- - time (s): fase temporal
- - wavelengthPx (px): escala espacial
    \*/

/\*\* noise field

- Campo de ruído contínuo.
-
- PARÂMETROS:
- - time (s): tempo contínuo
- - wavelengthPx (px):
- > 300–600 → nuvens suaves
- > 100–300 → fumo
- > 30–80 → jitter
  > \*/

/\*\*

- Campo de jitter local.
-
- PARÂMETROS:
- - wavelengthPx (px):
- > 150–300 → distorção leve
- > 60–150 → agitação local
- > 20–60 → jitter agressivo
-
- - phase: fase abstrata (não temporal)
    \*/

/\*\*

- Campo de onda radial.
-
- PARÂMETRO:
- - wavelengthPx (px):
- > 400–800 → ondas largas (respiração)
- > 200–400 → ondas médias (fluido)
- > 80–150 → vibração energética
  > \*/
