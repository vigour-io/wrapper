# native
repo to do the native stuff

biggest challenges :
  get a system thats integrated with npm
  
  
  
usecase 
  client - project X
    requires -- vigour-facebook
                  ios
                  android
                  native-bridge
                  web
                  and the V.Value wrapped api (this is what is exposed)
                  
                  

examples pck.json project X
```
  {
    dependencies: {
      vigour-facebook: 'x.x.x'
    }
  , devDependencies: {
      vigour-dev-tools: 'x.x.x.
    }
  }
```

examples pck.json vigour-facebook
```
  {
    dependencies: {
      vigour-native:'x.x.x'
    }
  }
```


example install project X
```
  //this gets added by vigour dev tools ( just some run scripts )
  npm run build --android --ios
```

example install project X
```
  //this gets added by vigour dev tools ( just some run scripts )
  cd projectX
  vigour-dev-tools build -android
```





ios


android


