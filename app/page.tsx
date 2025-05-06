import React from 'react';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { Divider } from '@nextui-org/divider';

export default function EducationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Interactive Video AI Demo Portal</h1>

      <Card className="mb-8">
        <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
          <h2 className="text-xl font-bold">Welcome to the Demo Portal</h2>
        </CardHeader>
        <CardBody className="py-4">
          <p className="mb-4">
            This is the demo subdomain of{' '}
            <a
              href="https://www.advantageintegrationai.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              <strong style={{ textDecoration: 'underline' }}>Advatage Integration, LLC</strong>
            </a>
            .
          </p>
          <p>Here you can access demo scenarios and interactive learning experiences.</p>
        </CardBody>
      </Card>

      <Divider className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
            <h3 className="text-lg font-bold">Education Demos</h3>
          </CardHeader>
          <CardBody className="py-4">
            <p>Access education demo scenarios and interactive simulations.</p>
            <div className="mt-4">
              <a
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                href="/education"
              >
                Go to Education Portal
              </a>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
            <h3 className="text-lg font-bold">Healthcare Demos</h3>
          </CardHeader>
          <CardBody className="py-4">
            <p>Access healthcare demo scenarios and interactive simulations.</p>
            <div className="mt-4">
              <a
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                href="/healthcare"
              >
                Go to Healthcare Portal
              </a>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
