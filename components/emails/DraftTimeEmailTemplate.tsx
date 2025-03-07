import { Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text } from "@react-email/components"

interface DraftTimeEmailTemplateProps {
  userName: string
  leagueName: string
  draftDate: string
  draftTime: string
  isUpdate: boolean
  leagueId: string
}

export function DraftTimeEmailTemplate({
  userName,
  leagueName,
  draftDate,
  draftTime,
  isUpdate,
  leagueId,
}: DraftTimeEmailTemplateProps) {
  // Generate the league URL
  const leagueUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/pools/march-madness-draft/${leagueId}`

  return (
    <Html>
      <Head>
        {/* Add meta tag for color scheme support */}
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{`
          @media (prefers-color-scheme: dark) {
            .dark-mode-bg { background-color: #1e293b !important; }
            .dark-mode-text { color: #f8fafc !important; }
            .dark-mode-secondary-bg { background-color: #334155 !important; }
            .dark-mode-secondary-text { color: #e2e8f0 !important; }
            .dark-mode-border { border-color: #475569 !important; }
            .dark-mode-button { background-color: #3b82f6 !important; color: #ffffff !important; }
            .dark-mode-link { color: #60a5fa !important; }
            .dark-mode-muted { color: #94a3b8 !important; }
          }
        `}</style>
      </Head>
      <Preview>
        {isUpdate
          ? `Draft Time Updated: ${leagueName} - ${draftDate} at ${draftTime}`
          : `Draft Time Set: ${leagueName} - ${draftDate} at ${draftTime}`}
      </Preview>
      <Body style={main} className="dark-mode-bg">
        <Container style={container}>
          <Heading style={h1} className="dark-mode-text">
            {isUpdate ? "Draft Time Updated!" : "Draft Time Set!"}
          </Heading>

          <Section style={section} className="dark-mode-secondary-bg dark-mode-border">
            <Text style={text} className="dark-mode-text">
              Hi {userName},
            </Text>
            <Text style={text} className="dark-mode-text">
              {isUpdate
                ? `The draft time for ${leagueName} has been updated.`
                : `The draft time for ${leagueName} has been set.`}
            </Text>

            <Section style={draftInfoBox} className="dark-mode-secondary-bg dark-mode-border">
              <Text style={draftInfoHeading} className="dark-mode-text">
                Mark Your Calendar!
              </Text>
              <Text style={draftInfoText} className="dark-mode-secondary-text">
                <strong>Date:</strong> {draftDate}
              </Text>
              <Text style={draftInfoText} className="dark-mode-secondary-text">
                <strong>Time:</strong> {draftTime}
              </Text>
            </Section>

            <Text style={text} className="dark-mode-text">
              Be sure to join the draft on time to select your teams. Missing the draft will result in auto-picks.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={leagueUrl} className="dark-mode-button">
                Go to League Page
              </Button>
            </Section>

            <Text style={text} className="dark-mode-text">
              If you're having trouble with the button, you can also copy and paste this link into your browser:
            </Text>

            <Text style={linkText} className="dark-mode-text">
              <Link href={leagueUrl} style={link} className="dark-mode-link">
                {leagueUrl}
              </Link>
            </Text>

            <Text style={text} className="dark-mode-text">
              Good luck and see you at the draft!
            </Text>
          </Section>

          <Text style={footer} className="dark-mode-muted">
            © {new Date().getFullYear()} March Madness Draft. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles - Updated to match the website color scheme
const main = {
  backgroundColor: "#f8fafc", // Matches --secondary: 210 40% 96.1%
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "580px",
}

const section = {
  backgroundColor: "#ffffff", // Matches --background: 0 0% 100%
  padding: "24px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0", // Matches --border: 214.3 31.8% 91.4%
}

const h1 = {
  color: "#0f172a", // Matches --foreground: 222.2 84% 4.9%
  fontSize: "24px",
  fontWeight: "bold",
  margin: "32px 0",
  textAlign: "center" as const,
}

const text = {
  color: "#0f172a", // Matches --foreground: 222.2 84% 4.9%
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
}

const draftInfoBox = {
  backgroundColor: "#f1f5f9", // Matches --secondary: 210 40% 96.1%
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
  border: "1px solid #e2e8f0", // Matches --border: 214.3 31.8% 91.4%
}

const draftInfoHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#2563eb", // Matches --primary: 221.2 83.2% 53.3%
  margin: "0 0 12px 0",
  textAlign: "center" as const,
}

const draftInfoText = {
  fontSize: "16px",
  color: "#1e293b", // Matches --secondary-foreground: 222.2 47.4% 11.2%
  margin: "8px 0",
}

const buttonContainer = {
  margin: "32px 0",
  textAlign: "center" as const,
}

const button = {
  backgroundColor: "#2563eb", // Matches --primary: 221.2 83.2% 53.3%
  borderRadius: "8px", // Matches --radius: 0.5rem
  color: "#f8fafc", // Matches --primary-foreground: 210 40% 98%
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
}

const linkText = {
  color: "#0f172a", // Matches --foreground: 222.2 84% 4.9%
  fontSize: "14px",
  lineHeight: "24px",
  margin: "16px 0",
  textAlign: "center" as const,
}

const link = {
  color: "#2563eb", // Matches --primary: 221.2 83.2% 53.3%
  textDecoration: "underline",
}

const footer = {
  color: "#64748b", // Matches --muted-foreground: 215.4 16.3% 46.9%
  fontSize: "12px",
  lineHeight: "16px",
  margin: "32px 0 0",
  textAlign: "center" as const,
}

