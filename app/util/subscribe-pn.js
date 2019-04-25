const subscribePn = async () => {
  const sw = await navigator.serviceWorker.ready;
  const sub = await sw.pushManager.getSubscription();
  return (
    sub ||
    sw.pushManager.subscribe({
      userVisibleOnly: true,
    })
  );
};

export default subscribePn;
