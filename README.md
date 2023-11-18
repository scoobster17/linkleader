# LinkLeader

## How It Works

Chrome Profile details are stored at `~/Library/Application Support/Google/Chrome`, and the `Local State` file (which seems to be in JSON format despite not having that explicit extension) lists Chrome profiles under `profile.info_cache`, with the object key for each profile being the folder identifier in this Chrome folder for other profile data, e.g. 'Default' or 'Profile 1'.

## Notes

Can't use electron forge due to this bug https://github.com/electron/forge/issues/2633
