// async function fetchToken() {
//   const url = privateEndpointEnabled
//     ? `https://${privateEndpoint}/tts/cognitiveservices/avatar/relay/token/v1`
//     : `https://${cogSvcRegion}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`;
//
//   try {
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Ocp-Apim-Subscription-Key': cogSvcSubKey,
//       },
//     });
//
//     if (!response.ok) {
//       throw new Error('Network response was not ok');
//     }
//
//     const responseData = await response.json();
//     const iceServerUrl = responseData.Urls[0];
//     const iceServerUsername = responseData.Username;
//     const iceServerCredential = responseData.Password;
//
//     // setupWebRTC(iceServerUrl, iceServerUsername, iceServerCredential);
//     console.log(iceServerUrl, iceServerUsername, iceServerCredential)
//   } catch (error) {
//     console.error('Fetch error:', error);
//   }
// }
