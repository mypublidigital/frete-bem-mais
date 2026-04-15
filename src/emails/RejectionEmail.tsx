import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface RejectionEmailProps {
  name: string;
  role: "shipper" | "carrier";
  reason: string;
}

export function RejectionEmail({ name, role, reason }: RejectionEmailProps) {
  const roleLabel = role === "shipper" ? "Embarcador" : "Transportador";

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Atualização sobre seu cadastro na Frete Bem+</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>Frete Bem+</Text>
          </Section>

          <Section style={content}>
            <Heading style={heading}>Resultado do seu Cadastro</Heading>

            <Text style={paragraph}>Olá, {name}!</Text>

            <Text style={paragraph}>
              Agradecemos seu interesse em se cadastrar como <strong>{roleLabel}</strong> na
              plataforma Frete Bem+. Após análise da nossa equipe, infelizmente seu cadastro
              não pôde ser aprovado neste momento.
            </Text>

            <Section style={reasonBox}>
              <Text style={reasonLabel}>Motivo da reprovação:</Text>
              <Text style={reasonText}>{reason}</Text>
            </Section>

            <Text style={paragraph}>
              Se você acredita que houve um erro ou deseja esclarecer alguma informação,
              entre em contato com nossa equipe de suporte.
            </Text>

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

const reasonBox: React.CSSProperties = {
  backgroundColor: "#fff5f3",
  border: "1px solid #fdd5cc",
  borderRadius: "6px",
  padding: "16px 20px",
  margin: "24px 0",
};

const reasonLabel: React.CSSProperties = {
  color: "#E84425",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  margin: "0 0 6px",
};

const reasonText: React.CSSProperties = {
  color: "#333333",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
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
