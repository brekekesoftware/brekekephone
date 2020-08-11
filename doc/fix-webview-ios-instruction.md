### Fix ios deprecated UIWebView in React Native

- Make sure to pull your code latest, and run `yarn install`

- In XCode open the tree as following Phone > Libraries > React.xcodeproj > React > Views:
  ![fix-webview-ios1.png](./fix-webview-ios1.png)
- Select the web view files and remove them:
  ![fix-webview-ios2.png](./fix-webview-ios2.png)

- Archive the project again. Note: everytime you archive the project, you should check if those files must be removed
