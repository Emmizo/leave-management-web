const MICROSOFT_CLIENT_ID = "3193b05b-c8ec-4bad-8e5a-0845d604883d";
const MICROSOFT_TENANT_ID = "202c75b4-8389-4dce-b7a9-9d2c4f7b1bad";
const REDIRECT_URI = "http://localhost:3000/microsoft-callback"; // Don't encode the entire URI here!

export const initiateLoginWithMicrosoft = () => {
  const authUrl = `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`
    + `?client_id=${MICROSOFT_CLIENT_ID}`
    + `&response_type=token id_token`
    + `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` // Only encode when building the URL
    + `&response_mode=fragment`
    + `&scope=openid%20profile%20email%20User.Read`
    + `&nonce=${Math.random().toString(36).substring(2)}`;
    
  // Redirect to Microsoft login
  window.location.href = authUrl;
};