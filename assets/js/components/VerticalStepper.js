import React from "react";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "./TextField";

function getSteps() {
    return ["Provide your email", "Receive your coupon!"];
}

function getStepContent(step) {
    switch (step) {
        case 0:
            return `Please enter your email address:`;
        case 1:
            return `We have sent a coupon code to your email address.`;
        default:
            return `Unknown step`;
    }
}

export default function VerticalLinearStepper() {
    const [activeStep, setActiveStep] = React.useState(0);
    const steps = getSteps();

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                        <StepContent>
                            <Typography>{getStepContent(index)}</Typography>
                            {activeStep === 0 ? <TextField /> : null}
                            <Box sx={{ mb: 2 }}>
                                {activeStep === 0 && (
                                    <div>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleNext}
                                            sx={{ mt: 1, mr: 1 }}
                                        >
                                            Submit
                                        </Button>
                                    </div>
                                )}
                            </Box>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
}
