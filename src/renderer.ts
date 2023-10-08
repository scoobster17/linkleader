type Func = (event: any, webData: { profiles: any[], url: string }) => void;
type ExtendedWindow = Window & { electronApi: { openLinkInProfile: (url: string, email: string) => void, sendWebData: (func: Func) => void } };

window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('ol')?.addEventListener('click', (event) => {
        if ((event.target as any)?.tagName !== 'LI') {
            return;
        }

        const urlSpan = document.getElementById('urlSpan');
        if (!urlSpan) { return; }

        (window as unknown as ExtendedWindow).electronApi.openLinkInProfile(urlSpan.innerHTML, (event.target as any).getAttribute('data-profile-email'));
    });

    (window as unknown as ExtendedWindow).electronApi.sendWebData((_event, webData) => {
        console.log(webData);
        
        const profileList = document.getElementById('profileList');
        if (!profileList) { return; };

        const urlSpan = document.getElementById('urlSpan');
        if (!urlSpan) { return; }

        const { profiles, url } = webData;

        urlSpan.insertAdjacentHTML('beforeend', url);
    
        profiles.forEach((profile) => {
          const li = document.createElement('li');
          li.setAttribute('data-profile-email', profile.user_name);
          li.insertAdjacentHTML('beforeend', `${profile.id} : ${profile.name} : ${profile.user_name}`);
          profileList.appendChild(li);
        });
    });
});