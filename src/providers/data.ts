import { createDataProvider, CreateDataProviderOptions } from "@refinedev/rest";
import { BACKEND_BASE_URL } from "@/constants";
import { ListResponse } from "@/types";

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.toLowerCase().includes("application/json");

  if (!isJson) {
    const bodyPreview = await response
      .clone()
      .text()
      .then((t) => t.slice(0, 400))
      .catch(() => "");

    // This usually happens when an API route is missing and Express returns
    // an HTML error page (<!DOCTYPE ...>), but the client tries to parse JSON.
    throw new Error(
      [
        `Expected JSON but received "${contentType || "unknown content-type"}".`,
        `Status: ${response.status || "unknown"} ${response.statusText || ""}`.trim(),
        `URL: ${response.url || "unknown"}`,
        bodyPreview ? `Body (first 400 chars): ${bodyPreview}` : undefined,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  return (await response.clone().json()) as T;
}

const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({ resource }) => resource,
    buildQueryParams: async ({ filters, resource, pagination }) => {
      const page = pagination?.currentPage ?? 1;
      const pageSize = pagination?.pageSize ?? 10;

      const params: Record<string, string | number> = { page, limit: pageSize };

      filters?.forEach((filter) => {
        const field = 'field' in filter ? filter.field : '';

        const value = String(filter.value);

        if (resource === 'subjects') {
          if (field === 'department') params.department = value;
          if (field === 'name' || field === 'code') params.search = value;
        }
      });

      return params;
    },
    mapResponse: async (response) => {
      const payload = await parseJsonOrThrow<ListResponse>(response);

      return payload.data ?? [];
    },
    getTotalCount: async (response) => {
      // Clone the response to avoid consuming the body stream twice
      const payload = await parseJsonOrThrow<ListResponse>(response);

      return payload.pagination?.total ?? payload.data?.length ?? 0;
    }
  }
}

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);

export { dataProvider };