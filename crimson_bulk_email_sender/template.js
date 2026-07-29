/**
 * Returns a beautifully designed, responsive HTML email advertisement template focusing on the Onam flyer.
 */
function getOnamAdTemplate() {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Celebrate Onam with Crimson</title>
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      background-color: #FAF7F2;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      display: block;
    }
    .btn {
      text-decoration: none;
      display: inline-block;
      font-weight: bold;
      text-align: center;
      background-color: #25D366;
      color: #FFFFFF !important;
      border-radius: 30px;
      padding: 15px 35px;
      font-size: 15px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
  </style>
</head>
<body>
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF7F2; padding: 20px 0;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table class="container" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E5E0D8; box-shadow: 0 10px 30px rgba(153, 15, 2, 0.06);">
          
          <!-- Onam Flyer Image (embedded using CID) -->
          <tr>
            <td align="center">
              <img src="cid:onam_flyer" alt="Celebrate Onam with Crimson - Corporate Gift Combos" width="600" style="width: 100%; max-width: 600px; display: block;" />
            </td>
          </tr>
          
          <!-- Order Button Section -->
          <tr>
            <td align="center" style="padding: 40px 30px; background-color: #FFFFFF;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 22px; font-weight: bold; color: #990F02; padding-bottom: 4px; text-align: center;">
                    Ready to Place an Order?
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-style: italic; color: #666666; padding-bottom: 12px; text-align: center;">
                    We can design your branding also
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #555555; line-height: 1.5; padding-bottom: 25px; font-weight: 500; text-align: center;">
                    Click the button below to connect with us on WhatsApp for orders,<br/>custom corporate pricing, or enquiries.
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="https://wa.me/919946799457?text=Hello%20Crimson,%20I%20would%20like%20to%20order%20the%20Onam%20Corporate%20Gift%20Combos." class="btn">
                      Order / Inquire on WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

module.exports = {
  getOnamAdTemplate
};
