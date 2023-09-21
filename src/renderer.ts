type Func = (event: any, profiles: any[]) => void;
type ExtendedWindow = Window & { electronApi: { openLinkInProfile: (url: string, email: string) => void, sendProfiles: (func: Func) => void } };

window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('ol')?.addEventListener('click', (event) => {
        if ((event.target as any)?.tagName !== 'LI') {
            return;
        }

        (window as unknown as ExtendedWindow).electronApi.openLinkInProfile('https://mail.google.com', (event.target as any).getAttribute('data-profile-email'));
    });

    (window as unknown as ExtendedWindow).electronApi.sendProfiles((_event, profiles) => {
        console.log(profiles);
        
        const profileList = document.getElementById('profileList');
        if (!profileList) { return; };
    
        profiles.forEach((profile) => {
          const li = document.createElement('li');
          li.setAttribute('data-profile-email', profile.user_name);
          li.innerText = `${profile.id} : ${profile.name} : ${profile.user_name}`
          profileList.appendChild(li);
        });
    });
});