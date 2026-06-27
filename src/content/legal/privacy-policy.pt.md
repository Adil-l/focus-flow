# Focus Flow — Política de Privacidade

**Última atualização: [date]**

O Focus Flow é uma aplicação de produtividade pessoal para macOS, publicada por [Your Company]. Esta Política de Privacidade explica como a App lida com as suas informações. A versão curta: **o Focus Flow foi concebido para manter os seus dados no seu próprio Mac.**

---

## 1. O Nosso Princípio Fundamental: Local em Primeiro Lugar

Por predefinição, **tudo o que o Focus Flow guarda sobre si permanece no seu Mac.** Isto inclui:

- As suas definições e preferências;
- As suas estatísticas de foco e o histórico de sessões;
- As suas listas de bloqueio e horários de bloqueio;
- Qualquer palavra-passe ou frase de compromisso que defina para o trancamento de proteção (guardada de forma cifrada por hash — ver a Secção 4);
- Misturas de sons e outras personalizações.

**Estes dados não são transmitidos a nenhum servidor por predefinição.** Não operamos qualquer servidor que receba silenciosamente a sua atividade. Não vendemos nem alugamos os seus dados. Não lhe mostramos anúncios.

## 2. Funcionalidades Que Utilizam a Rede (Todas de Adesão Voluntária)

Algumas funcionalidades precisam da internet para funcionar. Estas são as **únicas** formas pelas quais o Focus Flow contacta um serviço externo, e cada uma é de **adesão voluntária** — só ocorre porque você a ativou ou realizou uma ação que obviamente a exige. Procuramos manter esta lista completa e atualizada:

- **Imagens de fundo / papel de parede.** Se optar por carregar imagens de fundo, a App solicita imagens a uma API de imagens de terceiros (por exemplo, um fornecedor de fotografias de banco ou de papéis de parede). Esse pedido revela necessariamente o endereço IP do seu dispositivo e um pedido básico a esse fornecedor, regido pela política de privacidade do próprio fornecedor. Se não utilizar esta funcionalidade, nenhum pedido deste tipo é efetuado.
- **Sincronização na nuvem / início de sessão opcional.** Se optar por iniciar sessão e ativar a sincronização na nuvem, os dados que escolher sincronizar (como definições e estatísticas) são enviados para o serviço de sincronização e por ele armazenados, para que possam ser partilhados entre os seus dispositivos. Isto só acontece depois de iniciar sessão e o ativar. Pode desativar a sincronização e manter-se totalmente local.
- **Funcionalidades de IA opcionais.** Se utilizar funcionalidades opcionais assistidas por IA (como a divisão de tarefas ou um coach de foco), o texto que submeter para essa funcionalidade é enviado ao fornecedor de IA que a alimenta, exclusivamente para gerar a sua resposta. Não submeta informações sensíveis que não queira que sejam processadas por esse fornecedor. Estas funcionalidades só são executadas quando você as invoca.
- **Pagamentos (Focus Flow Plus).** Se comprar o Plus, o pagamento é tratado no checkout alojado do nosso processador de pagamentos (Stripe) — nunca vemos nem guardamos os dados do seu cartão. Guardamos apenas o **estado da subscrição** (por exemplo, ativa ou cancelada, e a data de renovação) para a App saber se deve desbloquear as funções Plus.
- **Ranking global (opcional).** Se ativar o ranking global, o **nome de exibição** que escolher e as suas **contagens de pomodoros** são enviados ao nosso serviço e mostrados a outros utilizadores. Está desligado a menos que adira, e pode desligá-lo a qualquer momento.
- **Atualizações da App.** A App (ou a plataforma através da qual está instalada) pode verificar a existência de atualizações. Uma verificação de atualizações pode revelar o seu endereço IP e versão ao servidor de atualizações.

Se alguma funcionalidade futura vier a enviar dados para fora do seu dispositivo, divulgá-la-emos aqui e mantê-la-emos de adesão voluntária sempre que for viável.

## 3. Sem Análises ou Telemetria Sem Consentimento

**Não** recolhemos análises, telemetria, rastreio de utilização, relatórios de falhas ou dados comportamentais sem o seu consentimento. Se algum dia oferecermos diagnósticos opcionais (por exemplo, para nos ajudar a corrigir um problema), serão claramente identificados, **desativados por predefinição**, e algo que poderá ativar ou desativar a qualquer momento.

## 4. Palavras-passe e Frases de Compromisso

Se definir uma palavra-passe ou frase de compromisso para trancar as funcionalidades de proteção, esta é guardada **localmente e cifrada por hash** com uma função criptográfica unidirecional — não conservamos qualquer cópia legível e não é transmitida para fora do seu Mac. Por o hash ser unidirecional, **não conseguimos recuperar nem repor uma frase esquecida por si.** Guarde-a num local seguro.

## 5. Onde Residem os Dados e Como Eliminá-los

Os seus dados são armazenados localmente na sua conta de utilizador do macOS, normalmente nas pastas de suporte e de preferências da App (por exemplo, em `~/Library/Application Support/` e `~/Library/Preferences/`), e o bloqueador de sites escreve no ficheiro de hosts do sistema (`/etc/hosts`) apenas quando você ativa o bloqueio (ver o documento de Consentimento de Permissões do Sistema).

**Para eliminar todos os seus dados do Focus Flow:**

1. Na App, desligue o bloqueador de sites / "Desativar proteção". Isto remove as entradas do Focus Flow de `/etc/hosts` e remove quaisquer componentes auxiliares que tenha instalado (este passo solicita a sua palavra-passe de administrador).
2. Saia do Focus Flow e desinstale-o (mova a App para o Lixo).
3. Remova os ficheiros de suporte da App da sua Library de utilizador, incluindo as suas pastas em `~/Library/Application Support/`, `~/Library/Preferences/` e `~/Library/Caches/` (os nomes das pastas incluirão o identificador do Focus Flow).
4. Se ativou a sincronização na nuvem, inicie sessão no serviço de sincronização e elimine os seus dados sincronizados, ou contacte-nos através de **[contact email]** para solicitar a eliminação de quaisquer dados detidos pelo serviço de sincronização.

Após estes passos, os seus dados locais desaparecem. Não conseguimos recuperá-los, e você também não, por isso faça primeiro uma cópia de segurança de tudo o que quiser conservar.

## 6. Privacidade das Crianças

O Focus Flow destina-se a um público geral e **não se dirige a crianças com menos de 13 anos** (ou a idade mínima equivalente na sua jurisdição). Não recolhemos conscientemente informações pessoais de crianças. Como a App armazena os dados localmente e não exige uma conta para ser utilizada, em geral não recebemos quaisquer dados de crianças. Se acreditar que uma criança nos forneceu informações pessoais através de uma funcionalidade de adesão voluntária, contacte-nos através de **[contact email]** e eliminá-las-emos.

## 7. Segurança

Concebemos a App para manter os dados localmente e para usar as próprias proteções do seu sistema operativo. Nenhum método de armazenamento ou de transmissão é perfeitamente seguro, mas, como os seus dados residem sobretudo no seu próprio dispositivo, você mantém o controlo sobre eles. Proteja o seu Mac com uma palavra-passe de conta forte, encriptação do disco (FileVault) e atualizações atempadas.

## 8. Serviços de Terceiros

Quando utiliza uma funcionalidade de rede de adesão voluntária, a sua interação com esse terceiro (fornecedor de imagens, serviço de sincronização, fornecedor de IA ou servidor de atualizações) é também regida pela política de privacidade desse fornecedor. Recomendamos que reveja as políticas de qualquer serviço que escolha ativar.

## 9. Alterações a Esta Política

Poderemos atualizar esta Política de Privacidade periodicamente. Quando o fizermos, revemos a data de "Última atualização" e disponibilizamos a nova versão dentro da App. No caso de alterações substanciais, faremos um esforço razoável para as destacar. A sua utilização continuada após uma atualização significa que aceita a política revista.

## 10. Contacto

Tem questões sobre a sua privacidade ou sobre esta política? Contacte-nos através de **[contact email]**.
