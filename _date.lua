-- Lua filter: set date-modified from git, leave date (publish date) untouched
function Meta(meta)
  local handle = io.popen("git log -1 --format=%ci")
  if handle then
    local result = handle:read("*a")
    handle:close()
    local year, month, day = result:match("(%d+)-(%d+)-(%d+)")
    if year then
      local months = {
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      }
      local formatted = months[tonumber(month)] .. " " .. tonumber(day) .. ", " .. year
      meta["date-modified"] = pandoc.Inlines(pandoc.Str(formatted))
    end
  end
  return meta
end
