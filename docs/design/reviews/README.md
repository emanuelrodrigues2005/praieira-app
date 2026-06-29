# Interaction & Review — Design Handoff

> Especificação de interface e experiência do usuário para o módulo de Avaliações e Interações do Praieira App.

## Fluxos de Usuário

### 1. Avaliar um perfil comercial
```
Perfil comercial → Ver avaliações existentes → Abrir formulário de avaliação
→ Selecionar nota (1-5 estrelas) → Escrever comentário (opcional) → Enviar
→ Confirmação de sucesso → Média atualizada visível
```

### 2. Entrar em contato
```
Perfil comercial → Clicar em WhatsApp/Telefone → Mostrar disclaimer
("Esta ação registra intenção de contato, não representa venda confirmada")
→ Redirecionar para app externo → Registrar interação
```

### 3. Gerenciar avaliações (Turista)
```
Minhas avaliações → Ver lista → Editar (dentro da janela de 24h)
→ Salvar → Média atualizada
ou → Remover → Confirmar → Avaliação some da listagem e do cálculo
```

### 4. Moderar avaliações (Curador)
```
Painel de curadoria → Ver avaliações com alerta (nota ≤ 2) ou denunciadas
→ Analisar conteúdo → Decidir: Manter / Ocultar / Remover
→ Informar motivo → Registrar decisão → Avaliação atualizada
```

## Telas e Componentes

### Componentes Esperados

| Componente | Descrição |
|---|---|
| `ReviewSummary` | Média de estrelas, total de avaliações, distribuição por nota (barras) |
| `RatingDistribution` | Gráfico de barras horizontais: 5★ (74), 4★ (30), 3★ (10), 2★ (4), 1★ (2) |
| `ReviewList` | Lista paginada de avaliações públicas |
| `ReviewCard` | Card individual: nota (estrelas), comentário, data (sem identificação do autor) |
| `RatingStars` | Componente de 5 estrelas: selecionável (formulário) ou somente leitura (exibição) |
| `ReviewForm` | Formulário: seleção de estrelas + textarea com contador (0/1000) + botão enviar |
| `EditReviewDialog` | Modal/diálogo de edição (pré-preenchido) |
| `DeleteReviewDialog` | Modal de confirmação de remoção |
| `ContactButton` | Botão de WhatsApp/Telefone com ícone |
| `ExternalContactNotice` | Banner/aviso: "Você será direcionado para um serviço externo. Esta ação registra apenas intenção de contato." |
| `ContactIntentionDisclaimer` | Texto: "Intenção de contato — não representa venda ou transação confirmada" |
| `ModerationDialog` | Diálogo do curador: ação (ocultar/remover) + motivo (textarea) |
| `ReportDialog` | Diálogo de denúncia: selecionar motivo + detalhes opcionais |
| `ErrorState` | Estado de erro com mensagem e ação de retry |
| `EmptyState` | "Nenhuma avaliação ainda" com call-to-action |
| `LoadingSkeleton` | Skeleton para carregamento de cards de avaliação |
| `Pagination` | Controles de página (anterior/próximo) |
| `Toast/Feedback` | Notificações: "Avaliação enviada", "Avaliação atualizada", "Avaliação removida" |

## Estados da UI

### Para cada tela/componente:

| Estado | Descrição |
|---|---|
| **Loading** | Skeleton enquanto dados carregam |
| **Empty** | Mensagem + ilustração quando não há avaliações |
| **Success** | Dados renderizados normalmente |
| **Validation Error** | Campo inválido destacado com mensagem (rating fora do intervalo, comentário vazio) |
| **Unauthorized (401)** | Redirecionar para login |
| **Forbidden (403)** | "Você não tem permissão" (ex: WORKER tentando avaliar) |
| **Conflict (409)** | "Você já avaliou este perfil" ou "Janela de edição expirada" |
| **Not Found (404)** | "Perfil não encontrado" |
| **Service Unavailable** | "Serviço temporariamente indisponível" com retry |
| **Mobile** | Layout responsivo (360px+) |
| **Desktop** | Layout com maior espaçamento |

## Formulário de Avaliação

### Campos:
- **Rating:** Obrigatório. 1 a 5 estrelas. Navegável por teclado (← →). Leitor de tela anuncia valor. Estado visual: estrela preenchida (ativa) vs vazia (inativa).
- **Comment:** Opcional. Textarea com placeholder "Descreva sua experiência...". Contador de caracteres (0/1000). Trim automático. Mensagem de erro se apenas espaços.

### Validações:
- Rating deve estar entre 1 e 5
- Comentário não pode ser apenas espaços em branco
- Comentário máximo de 1000 caracteres
- Apenas TOURIST pode avaliar
- Um turista = uma avaliação por perfil

## Contato (WhatsApp/Telefone)

### Antes de abrir o app externo:
Mostrar modal/banner com:
- Ícone do canal (WhatsApp ou Telefone)
- Texto: "Você será direcionado para um serviço externo."
- Texto: "Este clique registra apenas uma intenção de contato. O Praieira App não confirma que houve venda ou contratação."
- Botão: "Continuar" / "Cancelar"

## Acessibilidade

- Navegação por teclado em todos os componentes
- Foco visível (outline) em elementos interativos
- Labels associados a campos (`aria-label`, `aria-labelledby`)
- Contraste mínimo WCAG AA (4.5:1 para texto normal, 3:1 para texto grande)
- Estrelas acessíveis: `role="radiogroup"` com `aria-label` para cada estrela
- Mensagens de erro associadas aos campos (`aria-describedby`)
- Confirmação de ações não baseada apenas em cor
- Suporte a viewport mínimo de 360px
- Alvo de toque mínimo de 44x44px
- `prefers-reduced-motion` respeitado para animações

## Design Tokens (Propostos)

```css
/* Spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;

/* Rating */
--rating-active: #F59E0B;    /* Amber-500 */
--rating-inactive: #D1D5DB;  /* Gray-300 */

/* Feedback */
--color-success: #10B981;    /* Emerald-500 */
--color-warning: #F59E0B;    /* Amber-500 */
--color-error: #EF4444;      /* Red-500 */
--color-info: #3B82F6;       /* Blue-500 */

/* Border radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
```
