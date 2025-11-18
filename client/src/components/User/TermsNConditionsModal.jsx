import {
  AlertCircle,
  Clock,
  Eye,
  FileText,
  Lock,
  Scale,
  Shield,
  UserCheck,
} from "lucide-react";
import { forwardRef, useImperativeHandle, useRef } from "react";

const TermsNConditionsModal = forwardRef(({ onAccept }, ref) => {
  const modalRef = useRef();

  useImperativeHandle(ref, () => ({
    open: () => modalRef.current.showModal(),
    close: () => modalRef.current.close(),
  }));

  const handleAccept = () => {
    if (onAccept) onAccept();
    modalRef.current.close();
  };

  return (
    <>
      <dialog ref={modalRef} className="modal">
        <div className="modal-box w-11/12 max-w-5xl max-h-[90vh] overflow-y-auto">
          {/* HEADER */}
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-3xl font-bold text-primary">
              Terms and Conditions
            </h1>
            <div className="flex justify-center gap-4 text-xs text-gray-600">
              <p>Effective: November 11, 2025</p>
              <span>•</span>
              <p>Last Updated: November 11, 2025</p>
            </div>
          </div>

          {/* WELCOME MESSAGE */}
          <div className="alert alert-info mb-4">
            <Shield className="w-5 h-5" />
            <div className="text-sm">
              <p className="font-semibold">Welcome to LikhaCampus</p>
              <p>
                By accessing or using our website, you agree to comply with and
                be bound by the following Terms and Conditions. Please read them
                carefully before using our services.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-4">
            In addition to these Terms and Conditions, we also publish a Privacy
            Policy. We encourage you to review it to understand how your
            personal information is collected, processed, stored, and protected
            when using our website.
          </p>

          {/* TABLE OF CONTENTS */}
          <div className="card bg-base-200 mb-6">
            <div className="card-body p-4">
              <h2 className="font-bold text-lg mb-3">Table of Contents</h2>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Acceptance of Terms</li>
                <li>Eligibility</li>
                <li>User Accounts</li>
                <li>Use of Services</li>
                <li>Intellectual Property Rights</li>
                <li>Limitation of Liability</li>
                <li>Suspension or Termination of Access</li>
                <li>Changes to These Terms</li>
              </ol>
            </div>
          </div>

          {/* SECTIONS */}
          <div className="space-y-6">
            {/* 1. ACCEPTANCE OF TERMS */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">1. Acceptance of Terms</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                By creating an account, accessing, or using any part of our
                website, you acknowledge that you have read, understood, and
                agreed to be bound by these Terms and Conditions, as well as our
                Privacy Policy.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                If you do not agree with any part of these terms, you must
                discontinue use of the website immediately.
              </p>
            </section>

            {/* 2. ELIGIBILITY */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">2. Eligibility</h3>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                <li>
                  You must be a current student or authorized member of Cavite
                  State University – CCAT Campus to create an account or use the
                  platform.
                </li>
                <li>
                  By using the website, you represent that all information you
                  provide is true, accurate, and up to date.
                </li>
              </ul>
            </section>

            {/* 3. USER ACCOUNTS */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">3. User Accounts</h3>
              </div>
              <p className="text-sm text-gray-700">
                To access certain features of the website, you may need to
                register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                <li>
                  Provide accurate and complete information when registering.
                </li>
                <li>Maintain the confidentiality of your login credentials.</li>
                <li>
                  Be responsible for all activities that occur under your
                  account.
                </li>
                <li className="font-semibold">
                  Create and maintain only one (1) account per user. Multiple
                  accounts under the same individual are strictly prohibited.
                </li>
              </ul>
              <div className="alert alert-warning mt-2">
                <AlertCircle className="w-5 h-5" />
                <p className="text-xs">
                  If you suspect unauthorized use of your account, you must
                  notify the CSG immediately. The Central Student Government
                  (CSG) is not liable for losses or damages resulting from
                  unauthorized access due to your failure to protect your
                  credentials.
                </p>
              </div>
            </section>

            {/* 4. USE OF SERVICES */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">4. Use of Services</h3>
              </div>
              <p className="text-sm text-gray-700">
                You agree to use this website only for lawful purposes and in
                accordance with university policies.
              </p>
              <p className="text-sm text-gray-700 font-semibold">
                You must not:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                <li>
                  Attempt to gain unauthorized access to our systems or other
                  users' accounts.
                </li>
                <li>
                  Upload, post, or share harmful, defamatory, or inappropriate
                  content.
                </li>
                <li>
                  Use automated tools or scripts to extract data (data scraping
                  or crawling).
                </li>
                <li>
                  Misrepresent your identity or affiliation with the university.
                </li>
              </ul>
              <p className="text-sm text-gray-700 font-semibold mt-2">
                Violation of these terms may result in suspension or permanent
                deletion of your account.
              </p>
            </section>

            {/* 5. INTELLECTUAL PROPERTY RIGHTS */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">
                  5. Intellectual Property Rights
                </h3>
              </div>
              <p className="text-sm text-gray-700">
                All content on this website including text, logos, graphics, and
                digital materials is the intellectual property of LikhaCampus
                website.
              </p>
              <p className="text-sm text-gray-700">
                You may not copy, modify, distribute, or reproduce any content
                from this website without prior written consent from the CSG.
              </p>
            </section>

            {/* 6. LIMITATION OF LIABILITY */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">
                  6. Limitation of Liability
                </h3>
              </div>
              <p className="text-sm text-gray-700">
                The website and its contents are provided "as is" and "as
                available."
              </p>
              <p className="text-sm text-gray-700">
                To the fullest extent permitted by law, the Central Student
                Government (CSG) shall not be liable for any direct, indirect,
                incidental, or consequential damages arising from:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                <li>Your access or use of the website.</li>
                <li>Any errors, interruptions, or security breaches.</li>
                <li>Unauthorized access to your personal data.</li>
              </ul>
            </section>

            {/* 7. SUSPENSION OR TERMINATION */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">
                  7. Suspension or Termination of Access
                </h3>
              </div>
              <p className="text-sm text-gray-700">
                We reserve the right to suspend or terminate your access to the
                website at any time, if we believe that you have violated these
                Terms and Conditions or engaged in unauthorized activity.
              </p>
            </section>

            {/* 8. CHANGES TO TERMS */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">8. Changes to These Terms</h3>
              </div>
              <p className="text-sm text-gray-700">
                We may update or modify these Terms and Conditions from time to
                time to reflect changes in our practices or for other
                operational, legal, or regulatory reasons.
              </p>
              <p className="text-sm text-gray-700">
                All revisions will be posted on this page, and continued use of
                the website constitutes your acceptance of the updated terms.
              </p>
            </section>
          </div>

          {/* DIVIDER */}
          <div className="divider my-6"></div>

          {/* PRIVACY POLICY SECTION */}
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-3xl font-bold text-primary">Privacy Policy</h1>
            <div className="flex justify-center gap-4 text-xs text-gray-600">
              <p>Effective: November 11, 2025</p>
              <span>•</span>
              <p>Last Updated: November 11, 2025</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-4">
            This Privacy Policy explains how LikhaCampus collects, processes,
            stores, and protects your personal information when you use our
            website. If you have any questions, please contact us.
          </p>

          {/* PRIVACY TABLE OF CONTENTS */}
          <div className="card bg-base-200 mb-6">
            <div className="card-body p-4">
              <h2 className="font-bold text-lg mb-3">Table of Contents</h2>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Data Retention</li>
                <li>Information We Collect</li>
                <li>How We Use Your Information</li>
                <li>Legal Basis for Processing</li>
                <li>Sharing of Personal Information</li>
                <li>Data Security</li>
                <li>Compliance with the Data Privacy Act of 2012</li>
                <li>Your Rights</li>
                <li>Cookies and Tracking</li>
                <li>Changes to This Privacy Policy</li>
              </ol>
            </div>
          </div>

          {/* PRIVACY SECTIONS */}
          <div className="space-y-6">
            {/* 1. DATA RETENTION */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">1. Data Retention</h3>
              </div>
              <p className="text-sm text-gray-700">
                We will retain your personal information only for as long as
                necessary to fulfill the purposes outlined in this Privacy
                Policy, unless you choose to delete or deactivate your account.
              </p>
              <p className="text-sm text-gray-700">
                Personal data is retained only as long as necessary to provide
                services or comply with legal obligations.
              </p>
            </section>

            {/* 2. INFORMATION WE COLLECT */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">2. Information We Collect</h3>
              </div>
              <p className="text-sm text-gray-700">
                We collect and process personal data such as your:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                <li>Full name</li>
                <li>Year level</li>
                <li>Program</li>
                <li>Email address</li>
                <li>Password</li>
                <li>Registration form</li>
              </ul>
              <p className="text-sm text-gray-700">
                By using our website, you consent to our collection and
                processing of your personal data in accordance with our Privacy
                Policy.
              </p>
              <p className="text-sm text-gray-700">
                We do not collect sensitive personal information unless required
                by law or with your explicit consent.
              </p>
            </section>

            {/* 3. HOW WE USE YOUR INFORMATION */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">
                  3. How We Use Your Information
                </h3>
              </div>
              <p className="text-sm text-gray-700">
                Your information is used for:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                <li>Account creation and authentication</li>
                <li>Verification of student status</li>
                <li>Website security and fraud prevention</li>
                <li>Communication of announcements and updates</li>
              </ul>
            </section>

            {/* 4. LEGAL BASIS */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">
                  4. Legal Basis for Processing
                </h3>
              </div>
              <p className="text-sm text-gray-700">We process data based on:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                <li>
                  <strong>Consent:</strong> Explicit consent during registration
                </li>
                <li>
                  <strong>Legitimate Interests:</strong> To maintain security
                  and operations
                </li>
                <li>
                  <strong>Compliance with Law:</strong> When required by legal
                  obligations
                </li>
              </ul>
            </section>

            {/* 5. SHARING OF INFORMATION */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">
                  5. Sharing of Personal Information
                </h3>
              </div>
              <p className="text-sm text-gray-700">
                CSG does not sell or disclose personal data to third parties.
                Data is accessed only by authorized personnel and may be shared:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                <li>When required by law</li>
                <li>With explicit consent</li>
              </ul>
            </section>

            {/* 6. DATA SECURITY */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">6. Data Security</h3>
              </div>
              <p className="text-sm text-gray-700">
                We implement appropriate administrative, technical, and
                organizational measures to safeguard your personal information.
              </p>
              <p className="text-sm text-gray-700">
                While we strive to maintain the highest level of security, no
                online system is completely secure. By using our services, you
                acknowledge that you share and store information at your own
                risk, and the Central Student Government (CSG) shall not be
                liable for unauthorized access due to circumstances beyond our
                control.
              </p>
            </section>

            {/* 7. COMPLIANCE WITH DPA */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">
                  7. Compliance with the Data Privacy Act of 2012
                </h3>
              </div>
              <p className="text-sm text-gray-700">
                LikhaCampus fully complies with the Data Privacy Act of 2012
                (Republic Act No. 10173) and its Implementing Rules and
                Regulations. In accordance with the Act:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                <li>
                  Your personal information is collected, processed, stored, and
                  protected lawfully, fairly, and transparently.
                </li>
                <li>
                  Data is used only for legitimate academic and organizational
                  purposes.
                </li>
                <li>
                  Reasonable organizational, physical, and technical measures
                  are implemented to safeguard your data against unauthorized
                  access, alteration, disclosure, or loss.
                </li>
              </ul>
              <p className="text-sm text-gray-700 mt-2">
                For more information on your rights and the Data Privacy Act,
                visit the National Privacy Commission:
                <a
                  href="https://privacy.gov.ph/data-privacy-act/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary ml-1"
                >
                  https://privacy.gov.ph/data-privacy-act/
                </a>
              </p>
            </section>

            {/* 8. YOUR RIGHTS */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">8. Your Rights</h3>
              </div>
              <p className="text-sm text-gray-700">You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                <li>Access, correct, or delete personal information</li>
                <li>Withdraw consent</li>
                <li>
                  File a complaint with the NPC:{" "}
                  <a
                    href="https://privacy.gov.ph/data-privacy-act/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary"
                  >
                    https://privacy.gov.ph/data-privacy-act/
                  </a>
                </li>
              </ul>
            </section>

            {/* 9. COOKIES */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">9. Cookies and Tracking</h3>
              </div>
              <p className="text-sm text-gray-700">
                We may use cookies for functional purposes. No personal data is
                sold or shared via cookies.
              </p>
            </section>

            {/* 10. CHANGES TO PRIVACY POLICY */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">
                  10. Changes to This Privacy Policy
                </h3>
              </div>
              <p className="text-sm text-gray-700">
                We may update this Privacy Policy. Continued use of the website
                constitutes acceptance of the updated policy.
              </p>
            </section>
          </div>

          {/* AGREEMENT SECTION */}
          <div className="mt-6 p-4 border-t-2 border-gray-300">
            <p className="font-semibold text-sm mb-3">
              By clicking "Continue", I agree that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>
                I have read and accepted the Terms and Conditions and Privacy
                Policy.
              </li>
              <li>
                I agree to provide my personal data for security and legitimate
                purposes.
              </li>
              <li>
                I agree to receive notifications for announcements and updates.
              </li>
              <li>
                All information I provide is true, accurate, and complete.
              </li>
            </ul>
          </div>

          {/* ACTION BUTTONS */}
          <div className="modal-action mt-6">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAccept}
            >
              Continue
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => modalRef.current.close()}
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
});

export default TermsNConditionsModal;
