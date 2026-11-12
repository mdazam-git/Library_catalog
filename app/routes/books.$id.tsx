import { Form, Link, useActionData, useLoaderData } from "react-router";

import { getRepository } from "~/catalog/get-repository";
import { loadBook, performBookAction } from "~/catalog/route-helpers";

export async function loader({ params, request }: { params: { id?: string }; request: Request }) {
  const id = params.id ?? "";
  return loadBook(request, getRepository(), id);
}

export async function action({ params, request }: { params: { id?: string }; request: Request }) {
  const id = params.id ?? "";
  if (!id) {
    throw new Response("Not Found", { status: 404, statusText: "Not Found" });
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");
  const result = await performBookAction(request, getRepository(), id, intent);

  if (result.ok) {
    return result;
  }

  return {
    ok: false,
    code: result.code,
    message: result.message,
  };
}

export default function BookDetailPage() {
  const book = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const actionMessage = actionData && !actionData.ok ? actionData.message : null;
  const isHeld = book.heldByReader;
  const actionLabel = isHeld ? "Return" : "Checkout";
  const disabled = !isHeld && book.availableCopies === 0;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link to="/" className="inline-flex items-center text-sm font-semibold text-sky-700 hover:text-sky-600">
          ← Back to catalog
        </Link>

        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 md:grid-cols-[320px_1fr]">
            <img alt={book.title} className="h-full w-full object-cover" src={book.coverUrl} />
            <div className="space-y-5 p-6 md:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">{book.genre}</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">{book.title}</h1>
                <p className="mt-2 text-lg text-slate-600">by {book.author}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {book.availableCopies === 0 ? "None available" : `${book.availableCopies} of ${book.totalCopies} available`}
              </div>

              <p className="text-base leading-7 text-slate-700">{book.description}</p>

              {actionMessage ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {actionMessage}
                </div>
              ) : null}

              <Form method="post" className="pt-2">
                <input type="hidden" name="intent" value={isHeld ? "return" : "checkout"} />
                <button
                  className={
                    disabled
                      ? "w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-base font-semibold text-slate-400"
                      : "w-full rounded-xl bg-slate-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-700"
                  }
                  disabled={disabled}
                  type="submit"
                >
                  {disabled && !isHeld ? "No copies available" : actionLabel}
                </button>
              </Form>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

export function ErrorBoundary() {
  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Something went wrong.</h1>
        <p className="mt-3 text-slate-600">We could not load this book right now.</p>
        <Link to="/" className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">
          Back to catalog
        </Link>
      </div>
    </main>
  );
}
