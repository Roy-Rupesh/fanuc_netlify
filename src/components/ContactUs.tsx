import React, { useEffect, useState } from "react";
import { TextField, Button, Grid, Typography } from "@mui/material";
import {
  LocationOnOutlined as LocationIcon,
  LocalPostOfficeOutlined as EmailIcon,
  PhoneIphoneOutlined as Mobileicon,
} from "@mui/icons-material";
import "../assets/css/ContactUs.css";
const ContactUs: React.FC = () => {
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // After the component is mounted, trigger the animations
    setShowContactInfo(true);
    setShowForm(true);
  }, []);

  return (
    <section id="contact" className="contact">
      <div className="contact-container" data-aos="fade-up">
        <Typography>
          <h2>
            <span>Contact Us</span>
          </h2>{" "}
          <p>Contact us & get started</p>
        </Typography>

        <div className="row">
          <div
            className="col-lg-5 d-flex align-items-stretch"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div
              className={`info ${
                showContactInfo ? "open scale-in-hor-left" : ""
              }`}
            >
              <div className="address">
                <i className="bi bi-geo-alt">
                  <LocationIcon />
                </i>

                <h4>Location:</h4>
                <p>Plot No. E, 3/4, MIDC, Satara, Maharashtra 415004, India</p>
              </div>
              <div className="email">
                <i className="bi bi-envelope">
                  <EmailIcon />
                </i>
                <h4>Email:</h4>
                <p>info@wathare.com</p>
              </div>
              <div className="phone">
                <i className="bi bi-phone">
                  <Mobileicon />
                </i>
                <h4>Call:</h4>
                <p>+91 6574654645</p>
              </div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15205.303576325357!2d74.01065486351258!3d17.68205843998391!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc23953ded98e7d%3A0xed71efb212e6fda2!2sWathare%20Infotech%20Solutions!5e0!3m2!1sen!2sus!4v1697623787025!5m2!1sen!2sus"
                frameBorder="0"
                style={{ border: 0, width: "100%", height: "290px" }}
                allowFullScreen
              ></iframe>
            </div>
          </div>
          <div className="col-lg-7 mt-5 mt-lg-0 d-flex align-items-stretch">
            <form
              className={`contactus-form ${
                showForm ? "open scale-in-hor-right" : ""
              }`}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                  <TextField
                    label="Your Name"
                    variant="standard"
                    fullWidth
                    required
                    id="name"
                    name="name"
                    placeholder="Your Name"
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <TextField
                    label="Your Email"
                    variant="standard"
                    fullWidth
                    required
                    id="email"
                    name="email"
                    placeholder="Your Email"
                  />
                </Grid>
              </Grid>
              <TextField
                label="Subject"
                variant="standard"
                fullWidth
                required
                id="subject"
                name="subject"
                placeholder="Subject"
                className="form-group mt-3"
              />
              <TextField
                label="Message"
                variant="outlined"
                fullWidth
                required
                id="message"
                name="message"
                placeholder="Type your Message here."
                multiline
                className="form-group mt-3"
                minRows={2}
              />

              {/* <div className="my-3">
                <div className="loading">Loading</div>
                <div className="error-message"></div>
                <div className="sent-message">
                  Your message has been sent. Thank you!
                </div>
              </div> */}
              <div className="text-center">
                <Button variant="contained" color="primary" type="submit">
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
