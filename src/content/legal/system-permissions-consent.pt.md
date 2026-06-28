# Kipto — Permissões do Sistema e Consentimento

**Por favor, leia isto antes de ativar o bloqueador de sites.**

As funcionalidades de bloqueio de sites ("proteção") do Kipto precisam de fazer algumas alterações no seu Mac para que o bloqueio funcione de forma fiável em todos os seus navegadores. Queremos que compreenda **exatamente** quais são essas alterações e **porquê**, antes de autorizar o que quer que seja. Nada do que aqui se descreve acontece antes de você ativar a proteção e a aprovar explicitamente.

**Esta é uma ferramenta que você aponta a si mesmo.** Todo o objetivo do bloqueio é permitir que *você* torne voluntariamente os sites distrativos mais difíceis de alcançar, para que se possa concentrar. Você configura-a; você pode removê-la.

---

## O Que o Kipto Fará Com a Sua Autorização

Quando você ativa a proteção, e **apenas depois de a aprovar**, o Kipto pode realizar as seguintes ações privilegiadas:

### (a) Editar o ficheiro de hosts do sistema (`/etc/hosts`)
Para bloquear os sites que escolher **a nível de todo o sistema — em todos os navegadores** (Safari, Chrome, Firefox e outros) — o Kipto adiciona entradas ao ficheiro `/etc/hosts` do seu Mac. Estas entradas redirecionam os domínios que selecionou para que deixem de carregar. Adicionamos apenas os domínios associados à sua lista de bloqueio, dentro de uma secção do Kipto claramente identificada, e deixamos o resto do ficheiro intacto.

### (b) (Opcional) Tornar resiliente a extensão de navegador complementar
Se optar por uma proteção mais forte para o Chrome, o Kipto pode, adicionalmente:
- Instalar uma **entrada de política gerida do Chrome** que mantém instalada a extensão de navegador complementar do Kipto;
- Instalar um **pequeno auxiliar de atualização local** para que a extensão se mantenha atualizada; e
- Registar um **LaunchDaemon em segundo plano** para que a proteção se mantenha ativa e a extensão seja difícil de remover por impulso.

O objetivo é puramente impedir que *você* desative rapidamente o seu próprio bloqueio num momento de fraqueza — que é precisamente o propósito de uma ferramenta de compromisso. Isto é **opcional**; o bloqueio básico via ficheiro de hosts (a) funciona sem isto.

### (c) Você autoriza cada ação privilegiada com a sua própria palavra-passe do macOS
Cada alteração privilegiada é solicitada através da **caixa de diálogo nativa de autorização de administrador do macOS** disponibilizada pelo sistema operativo. Você escreve a sua palavra-passe de administrador nessa caixa de diálogo do sistema — e não no Kipto. **O Kipto nunca vê, guarda ou transmite a sua palavra-passe.** Se cancelar a caixa de diálogo do sistema, a alteração não acontece.

### (d) Tudo é verificável e totalmente reversível
Você mantém o controlo. A partir do Kipto, você pode:
- **Verificar** exatamente que domínios estão bloqueados e que componentes estão instalados;
- **Desligar tudo com um clique** ("Desativar proteção"), o que remove as entradas do Kipto em `/etc/hosts` e remove a entrada de política gerida, o auxiliar de atualização e o LaunchDaemon descritos em (b).

A remoção da proteção também utiliza a caixa de diálogo nativa de autorização do macOS. Nenhuma alteração feita pelo Kipto é permanente ou oculta.

### (e) Esta é uma restrição que você escolhe para si mesmo
O bloqueio é algo que **você impõe voluntariamente a si mesmo** para apoiar o seu próprio foco e objetivos. O Kipto não bloqueia nada por iniciativa própria e não decide o que é bom ou mau visitar — é você que decide.

---

## O Que o Kipto **Não** Faz

- **Não** contorna, desativa nem enfraquece as proteções de segurança do macOS (como a Proteção de Integridade do Sistema, o Gatekeeper ou a assinatura de código).
- **Não** atua sem a sua autorização explícita — cada passo privilegiado exige o pedido de palavra-passe do sistema.
- **Não** monitoriza, regista nem transmite o seu histórico de navegação. O bloqueio funciona tornando inacessíveis os domínios escolhidos; não observa para onde você vai.
- **Não** guarda nem envia a sua palavra-passe de administrador para lado nenhum.
- **Não** instala nada para proteção mais forte (b) a menos que você adira especificamente.

---

## Consentimento Informado

Ao prosseguir, você confirma que:

- **Compreende** as alterações descritas acima e **porquê** são feitas;
- É administrador deste Mac e está **autorizado** a fazer estas alterações;
- Está a ativar estas funcionalidades **voluntariamente**, para o seu próprio foco, num dispositivo que controla; e
- Compreende que as alterações são **transparentes, verificáveis e totalmente reversíveis** a partir do Kipto a qualquer momento.

Se não quiser que o Kipto faça quaisquer alterações ao sistema, pode usar as funcionalidades de temporizador, sons e estatísticas sem ativar a proteção. Também pode desligar a proteção mais tarde, a qualquer momento.

Tem questões? Contacte **[contact email]**.
