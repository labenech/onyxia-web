# 📐 Architecture

## Main rules

* [`src/app`](https://github.com/InseeFrLab/onyxia-web/tree/main/src/app) contains the React application, it's the UI of the app.
  * All the import of src/lib should be made in [`src/app/libApi`](https://github.com/InseeFrLab/onyxia-web/tree/main/src/app/libApi).
* [`src/lib`](https://github.com/InseeFrLab/onyxia-web/tree/main/src/lib) contains the 🧠 of the app.
  * Nothing in the `src/lib` directory should make any reference to React at all. A concept like react hooks for example is out of scope for the src/lib directory.
  * `src/lib` should never import anything from src/app, even type.
  * It should be possible for example to port onyxia-web to Vue.js or React Native without changing anything to the src/lib directory.
  * The goal of `src/lib` is to expose an API that makes it really easy to build a user interface around it.
  * The API exposed should be reactive. We should not expose to the UI functions that returns promise instead the function we expose should update states and the UI should react to these states update.

{% hint style="warning" %}
The src/js directory is legacy. It will be removed soon.
{% endhint %}

## Clean Archi

* Whenever we need to interact with the infrastructure we define a port in [`src/lib/port`](https://github.com/InseeFrLab/onyxia-web/tree/main/src/lib/ports). A port is only a type definition. In our case the infrastructure is the Keycloak server, the Vault server, the Minio server and Kubernetes API (Onyxia-API).
* In [`src/lib/secondaryAdapter`](https://github.com/InseeFrLab/onyxia-web/tree/main/src/lib/secondaryAdapters) are the implementation of the ports. For each port we should have at least two implementations a dummy and a real one. It enabled the app to still run, be it in degraded mode if one piece of the infrastructure is missing. Say we don’t have a Vault server for example we should still be able to launch containers.
* In [src/lib/useCase](https://github.com/InseeFrLab/onyxia-web/tree/main/src/lib/useCases) we expose APIs for the UI to consume.

{% hint style="info" %}
You might be surprised not to find a port for S3. It's because handled by the legacy code (src/js)
{% endhint %}

## In practice

Let's say we want to create a new page in onyxia-web where users can type in a repo name and get the current number of stars the repo has on GitHub.

{% embed url="https://youtu.be/RDxAag3Iq0o" %}

{% hint style="info" %}
You might wonder why some values, instead of being redux state, are returned by thunks functions. &#x20;

For example, it might seem more natural to do: &#x20;

```tsx
const { isUserLoggedIn } = useSelector(state => state.userAuthentication);
```

Instead of what we actually do, which is: &#x20;

```tsx
const { userAuthenticationThunks } = useThunks();
const isUserLoggedIn = userAuthenticationThunks.getIsUserLoggedIn();
```

However the rule is to never store as a redux state, values that are not susceptible to change. Redux states are values that we observe, any redux state changes should trigger a re-render of the React components that uses them. Conversely, there is no need to observe a value that will never change. We can get it once and never again, get it in a callback or wherever.&#x20;

But, you may object, users do login and logout, `isUserLoggedIn` is not a constant!&#x20;

Actually, from the standpoint of the web app, it is. When a user that isn't authenticated click on the login button, it is being redirected away. When he returns to the app everything is reloaded from scratch.
{% endhint %}

Now let's say we want the search to be restricted to a given GitHub organization. (Example: InseeFrLab.) The GitHub organization should be specified as an environment variable by the person in charge of deploying Onyxia. e.g.:

```yaml
  UI:
    image:
      name: inseefrlab/onyxia-web
      version: 0.15.13
    env:
      MINIO_URL: https://minio.lab.sspcloud.fr
      VAULT_URL: https://vault.lab.sspcloud.fr
      OIDC_URL: https://auth.lab.sspcloud.fr/auth
      OIDC_REALM: sspcloud
      TITLE: SSP Cloud
      ORG_NAME: InseeFrLab #<==========
      
```

If no `ORG_NAME` is provided by the administrator, the app should always show 999 stars for any repo name queried.

{% embed url="https://youtu.be/eaU-tYFzWwA" %}

## Another example: Recording user's GitLab token

Currently users can save their GitHub Personal access token in their Onyxia account but not yet their GitLab token. Let's see how we would implement that.

{% embed url="https://www.youtube.com/watch?v=WVFKCR1QfVk" %}