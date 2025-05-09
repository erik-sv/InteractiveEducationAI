import React from 'react';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Terms of Use & Disclaimer</h1>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">Test Application Notice</h2>
          <p className="text-muted-foreground">
            This is a test application that utilizes artificial intelligence technology. The
            platform is in development and is provided for testing and demonstration purposes only.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Data Collection & Usage</h2>
          <p className="text-muted-foreground">
            By using this application, you acknowledge and agree that your interactions may be
            collected and used to improve our platform and AI systems. This includes but is not
            limited to user inputs, responses, and usage patterns.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Disclaimer of Liability</h2>
          <p className="text-muted-foreground">
            Advantage Integration, LLC and its affiliates make no warranties or representations
            about the accuracy, reliability, completeness, or timeliness of the content, services,
            software, text, graphics, and links used on this application.
          </p>
          <p className="text-muted-foreground mt-2">
            The application is provided &quot;as is&quot; and &quot;as available&quot; without any
            warranty of any kind. We disclaim all warranties and conditions with regard to this
            information, including all implied warranties and conditions of merchantability, fitness
            for a particular purpose, title, and non-infringement.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">AI-Generated Content</h2>
          <p className="text-muted-foreground">
            This application uses AI to generate content and responses. While we strive for
            accuracy, we cannot guarantee that all AI-generated content will be completely accurate,
            reliable, or suitable for any specific purpose. Users should exercise their own judgment
            when using AI-generated content.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Changes to Terms</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify these terms at any time. Continued use of the application
            after any such changes constitutes your acceptance of the new terms.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Liability Disclaimer</h2>
          <p className="text-muted-foreground">
            You are solely responsible for any decisions or actions you take based on the
            information provided on this application. Advantage Integration, LLC shall not be liable
            for any losses or damages arising from your use of or reliance on such information. In
            no event shall Advantage Integration, LLC be liable for any direct, indirect,
            incidental, special, consequential, or punitive damages, resulting from your access to
            or use of this application.
          </p>
        </div>

        <div className="pt-4">
          <p className="text-sm text-muted-foreground">Last updated: December 19, 2024</p>
        </div>
      </section>
    </div>
  );
}
