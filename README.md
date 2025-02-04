# Getting Started with Cloning Github

First, clone the repo with button to the desired directory on your pc.

Second, cd to the folder.

Third, use commands to submit changes.

1. Check Status

### `git status`

2. Stage all the changes

### `git add .`

3. Commit the changes

### `git commit -m "Updated"`

4. Push the changes (upload) to main branch

### `git push origin main`

If updated from GitHub but not local, remember pull.

### `git fetch`
### `git pull origin main`


## Branches

If using another branch, follow these:

1. git clone the repo
2. Pull the latest changes to local main (up-to-date)
### `git checkout main`
### `git pull origin main`

3. Use the branch
### `git checkout frontendmodify`

4. Edit and add, commit
### `git add .`
### `git commit -m "Updated"`

5. Sync with main to avoid conflicts (same as update)
### `git checkout main`
### `git pull origin main`
### `git checkout frontendmodify`

6. Merge changes from main into branch
### `git merge main`

7. Push branch to GitHub
### `git push origin frontendmodify`

8. If want to update the main with latest changes of branch,
### `PULL REQUEST on GitHub`

## Available Scripts

## node_modules installation

Install the node_modules with command:

### `npm install`

Uninstall it with command:

### `rm -rf node_modules`

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
