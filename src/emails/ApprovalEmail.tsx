import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ApprovalEmailProps {
  name: string;
  role: "shipper" | "carrier";
  loginUrl: string;
}

export function ApprovalEmail({ name, role, loginUrl }: ApprovalEmailProps) {
  const roleLabel = role === "shipper" ? "Embarcador" : "Transportador";

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Seu cadastro na Frete Bem+ foi aprovado!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>Frete Bem+</Text>
          </Section>

          <Section style={content}>
            <Heading style={heading}>Cadastro Aprovado! ✓</Heading>

            <Text style={paragraph}>Olá, {name}!</Text>

            <Text style={paragraph}>
              Temos uma ótima notícia: seu cadastro como <strong>{roleLabel}</strong> na
              plataforma Frete Bem+ foi <strong>aprovado</strong> pela nossa equipe.
            </Text>

            <Text style={paragraph}>
              Você já pode acessar a plataforma e começar a usar todos os recursos disponíveis.
            </Text>

            <Section style={buttonSection}>
              <Button href={loginUrl} style={button}>
                Acessar a Plataforma
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Se você não reconhece esse e-mail, por favor ignore esta mensagem.
            </Text>
            <Text style={footer}>
              © {new Date().getFullYear()} Frete Bem+ — Todos os direitos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#f5f5f5",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "20px 0",
  maxWidth: "600px",
};

const logoSection: React.CSSProperties = {
  backgroundColor: "#000000",
  padding: "24px 40px",
  borderRadius: "8px 8px 0 0",
  textAlign: "center",
};

const logoText: React.CSSProperties = {
  color: "#E84425",
  fontSize: "28px",
  fontWeight: "800",
  margin: "0",
  letterSpacing: "-0.5px",
};

const content: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "0 0 8px 8px",
  border: "1px solid #e5e5e5",
  borderTop: "none",
};

const heading: React.CSSProperties = {
  color: "#111111",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 24px",
};

const paragraph: React.CSSProperties = {
  color: "#444444",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const buttonSection: React.CSSProperties = {
  margin: "32px 0",
  textAlign: "center",
};

const button: React.CSSProperties = {
  backgroundColor: "#E84425",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  padding: "14px 32px",
  textDecoration: "none",
  display: "inline-block",
};

const hr: React.CSSProperties = {
  borderColor: "#e5e5e5",
  margin: "24px 0",
};

const footer: React.CSSProperties = {
  color: "#999999",
  fontSize: "12px",
  margin: "0 0 4px",
  textAlign: "center",
};
