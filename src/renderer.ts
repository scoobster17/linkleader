type Rule = {
    url: string;
    profileEmail: string;
};
type Func = (event: any, webData: { profiles: any[], url: string, rules: Rule[] }) => void;
type ExtendedWindow = Window & {
    rules: Rule[],
    electronApi: {
        openLinkInProfile: (url: string, email: string) => void,
        updateConfig: (key: string, value: any) => void,
        sendWebData: (func: Func) => void,
    },
};

window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('ol')?.addEventListener('click', (event) => {
        if ((event.target as any)?.tagName !== 'LI') {
            return;
        }

        const urlSpan = document.getElementById('urlSpan');
        if (!urlSpan) { return; }

        (window as unknown as ExtendedWindow).electronApi.openLinkInProfile(urlSpan.innerHTML, (event.target as any).getAttribute('data-profile-email'));
    });

    document.querySelector('form')?.addEventListener('submit', (event) => {
        event.preventDefault();

        const urlSpan = document.getElementById('urlSpan');
        if (!urlSpan) {
            console.error('no url');
            return;
        }

        const profileEmail = document.querySelector('select')?.value;
        if (!profileEmail) {
            console.error('no profile email');
            return;
        }
        if (profileEmail === '-1') {
            console.error('select a profile');
            return;
        }

        const index = (window as unknown as ExtendedWindow).rules.findIndex(({ url }) => url === urlSpan.innerText);
        console.log('index', index, (window as unknown as ExtendedWindow).rules);
        if (index !== -1) {
            (window as unknown as ExtendedWindow).rules[index].profileEmail = profileEmail;
        } else {
            (window as unknown as ExtendedWindow).rules.push({ url: urlSpan.innerText, profileEmail });
        }
        console.log((window as unknown as ExtendedWindow).rules);
        (window as unknown as ExtendedWindow).electronApi.updateConfig('rules', (window as unknown as ExtendedWindow).rules);
        
        console.log('target', event.target, event.currentTarget);
        (event.target as HTMLFormElement | null)?.reset();

        (window as unknown as ExtendedWindow).electronApi.openLinkInProfile(urlSpan.innerHTML, profileEmail);
    });

    (window as unknown as ExtendedWindow).electronApi.sendWebData((_event, webData) => {
        console.log(webData);

        (window as unknown as ExtendedWindow).rules = webData.rules;
        
        const profileList = document.getElementById('profileList');
        if (!profileList) { return; };

        const profileDropdown = document.getElementById('profileDropdown');
        if (!profileDropdown) { return; };

        const urlSpan = document.getElementById('urlSpan');
        if (!urlSpan) { return; }

        const { profiles, url } = webData;

        urlSpan.innerText = url;

        console.log(profiles);
    
        profileList.innerHTML = '';
        profileDropdown.innerHTML = '<option value="-1">Select a profile...</option>';
        profiles.forEach((profile) => {
          console.log(profile);
          const li = document.createElement('li');
          li.setAttribute('data-profile-email', profile.user_name);
          li.insertAdjacentHTML('beforeend', `${profile.id} : ${profile.name} : ${profile.user_name}`);
          profileList.appendChild(li);

          const option = document.createElement('option');
          option.setAttribute('value', profile.user_name);
          option.innerText = profile.user_name;
          profileDropdown.appendChild(option);
        });
    });
});