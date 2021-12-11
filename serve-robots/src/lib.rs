use include_dir::{include_dir, Dir};
use worker::*;

mod utils;

const ROBOTS_DIR: Dir = include_dir!("robots");

fn log_request(req: &Request) {
    console_log!(
        "{} - [{}], located at: {:?}, within: {}",
        Date::now().to_string(),
        req.path(),
        req.cf().coordinates().unwrap_or_default(),
        req.cf().region().unwrap_or("unknown region".into())
    );
}

#[event(fetch)]
pub async fn main(req: Request, env: Env) -> Result<Response> {
    log_request(&req);

    utils::set_panic_hook();
    let router = Router::new();

    router
        .get_async("/robots.txt", |req, _| async move {
            if let Ok(url) = req.url() {
                if let Some(host) = url.host_str() {
                    if let Some(file) = ROBOTS_DIR.get_file(host) {
                        Response::ok(file.contents_utf8().unwrap())
                    } else {
                        let req = Request::new(&String::from(url), Method::Get).unwrap();
                        Fetch::Request(req).send().await
                    }
                } else {
                    Response::error("No host provided", 404)
                }
            } else {
                Response::error("Cannot parse URL", 400)
            }
        })
        .get("/worker-version", |_, ctx| {
            let version = ctx.var("WORKERS_RS_VERSION")?.to_string();
            Response::ok(version)
        })
        .run(req, env)
        .await
}
