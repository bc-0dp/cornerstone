import React from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

export default function BasicTextFields() {
    return (
        <Box
            component="form"
            sx={{
                "& > *": {
                    m: 1,
                    width: "200px",
                },
            }}
            noValidate
            autoComplete="off"
        >
            <TextField
                id="standard-basic"
                label="you@example.com"
                variant="standard"
            />
        </Box>
    );
}
