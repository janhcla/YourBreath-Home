export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = request.headers.get("host")?.split(":")[0] ?? url.hostname;

    if (host === "yourbreath.pages.dev") {
      url.hostname = "yourbreath.app";
      url.protocol = "https:";
      url.search = "";

      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
