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
        <div className="modal-box w-11/12 max-w-5xl">
          <h1 className="font-bold text-lg text-center">
            Terms and Conditions
          </h1>

          <section className="space-y-2">
            <h5 className="mt-2 font-semibold">TABLE OF CONTENTS</h5>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>What information do we collect?</li>
              <li>How do we process your information?</li>
              <li>When and with whom do we share your personal information?</li>
              <li>How long do we keep your information?</li>
              <li>How do we keep your information safe?</li>
              <li>What are your privacy rights?</li>
            </ul>
          </section>

          <section className="mt-4 space-y-2">
            <h5 className="font-semibold">
              1. WHAT INFORMATION DO WE COLLECT?
            </h5>
            <p>
              Personal Information Provided by You: We collect personal
              information that you voluntarily provide to us when you register
              on our website. This includes the following:
            </p>
            <ul className="list-disc list-inside ml-4">
              <li>Full name</li>
              <li>CvSU email</li>
              <li>Year</li>
              <li>Password</li>
            </ul>
            <p>
              Sensitive Information: We do not process sensitive information.
            </p>
            <p>
              All personal information that you provide to us must be true,
              complete, and accurate. You must notify us of any changes to such
              personal information.
            </p>
          </section>

          <section className="mt-4 space-y-2">
            <h5 className="font-semibold">
              2. HOW DO WE PROCESS YOUR INFORMATION?
            </h5>
            <p>
              We process your personal information to deliver and enhance our
              services, ensure security, prevent fraud, and comply with laws.
              Additionally, with your consent, we may process your information
              for the following purposes:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>
                <strong>Account Creation and Authentication:</strong>
                <p>
                  We may process your personal data to facilitate account
                  creation and enable secure login and authentication.
                </p>
              </li>
              <li>
                <strong>Verification of Student or Alumni Status:</strong>
                <p>
                  We may process your information to verify whether you are a
                  bona fide student or alumnus of CvSU-CCAT Campus. This may
                  include sending verification links for proper identification.
                </p>
              </li>
              <li>
                <strong>Website Security and Protection:</strong>
                <p>
                  Your information may be processed as part of our efforts to
                  maintain the safety and integrity of our website, including
                  activities related to fraud detection, monitoring, and
                  prevention.
                </p>
              </li>
            </ul>
          </section>

          <section className="mt-4 space-y-2">
            <h5 className="font-semibold">
              3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
            </h5>
            <p>
              We may share your personal information in situations where sharing
              is necessary to provide our services or comply with legal
              obligations.
            </p>
          </section>

          <section className="mt-4 space-y-2">
            <h5 className="font-semibold">
              4. HOW DO WE KEEP YOUR INFORMATION SAFE?
            </h5>
            <p>
              We aim to protect your personal information through a system of
              organizational and technical security measures.
            </p>
            <p>
              We have implemented appropriate and reasonable measures designed
              to secure the information we process. However, no electronic
              transmission or storage technology can be guaranteed to be 100%
              secure, so we cannot promise that unauthorized parties will never
              gain access to your information.
            </p>
          </section>

          <section className="mt-4 space-y-2">
            <h5 className="font-semibold">5. WHAT ARE YOUR PRIVACY RIGHTS?</h5>
            <p>
              If you would like to review or change your account information or
              deactivate your account, you can:
            </p>
            <ul className="list-disc list-inside ml-4">
              <li>
                Log in to your account settings and update your user account.
              </li>
            </ul>
            <p>
              Upon your request for permanent deactivation, your account and
              personal data will be removed from our database. However, certain
              information may be retained as necessary to prevent fraud and
              enforce our community guidelines.
            </p>
          </section>

          <div className="mt-6 py-4 text-sm text-gray-600 border-t">
            <p className="font-medium mb-2">
              By clicking on "Continue", I agree that:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>I have read and accepted the community guidelines.</li>
              <li>
                I agree to give my personal data for security and legitimate
                purposes.
              </li>
              <li>
                I agree to receive notifications for announcements and updates.
              </li>
            </ul>
          </div>

          <div className="modal-action mt-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAccept}
            >
              Continue
            </button>
            <button
              type="button"
              className="btn"
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
