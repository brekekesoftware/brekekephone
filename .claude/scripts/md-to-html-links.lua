-- 2026-10-19: report pages for nginx; a `path` in backticks must become a link relative to the page.
-- Usage: called by md-to-html.sh (pandoc --lua-filter md-to-html-links.lua), not on its own.
-- Env ROOT: the upload root (paths may start with it or be relative to it). Env BUILT: space-separated .md files
-- that also get an .html page; links to them go to the .html.
local path = pandoc.path
local root = os.getenv('ROOT')
local built = ' ' .. (os.getenv('BUILT') or '') .. ' '
local docdir
local itemdir

local function exists(p)
  local ok = os.rename(p, p)
  return ok
end

local function href_for(target)
  target = target:gsub('^%./', '')
  local rootname = path.filename(root)
  target = target:gsub('^' .. rootname:gsub('%-', '%%-') .. '/', '')
  local bases = { docdir, root }
  if itemdir then table.insert(bases, 1, itemdir) end
  for _, base in ipairs(bases) do
    local full = path.normalize(path.join({ base, target }))
    if not target:match('^/') and not target:match('^~') and exists(full) then
      if full:sub(1, #root) ~= root then return nil end
      if full:match('%.md$') and built:find(' ' .. full .. ' ', 1, true) then
        full = full:gsub('%.md$', '.html')
      end
      local rel = path.make_relative(full, docdir)
      if target:match('/$') and not rel:match('/$') then rel = rel .. '/' end
      return rel
    end
  end
  return nil
end

local inline_filter = {
  traverse = 'topdown',
  Code = function(el)
    local h = href_for(el.text)
    if h then return pandoc.Link({ el }, h, '', pandoc.Attr('', { 'file' })), false end
  end,
  Link = function(el)
    if not el.classes:includes('file') and not el.target:match('^%a+:') then
      local h = href_for(el.target)
      if h then
        el.target = h
        el.classes:insert('file')
      end
    end
    return el, false
  end,
}

-- A list item like "`folder/`: `a.json`, `b.log`" names files inside that folder.
local function item_folder(blocks)
  local first
  pandoc.Blocks(blocks):walk({
    Code = function(el)
      first = first or el.text
    end,
  })
  if first and first:match('/$') then
    local dir = path.normalize(path.join({ docdir, first }))
    if exists(dir) then return dir end
  end
end

function Pandoc(doc)
  docdir = path.directory(path.normalize(PANDOC_STATE.input_files[1]))
  return doc:walk({
    BulletList = function(list)
      for i, item in ipairs(list.content) do
        itemdir = item_folder(item)
        list.content[i] = pandoc.Blocks(item):walk(inline_filter)
        itemdir = nil
      end
      return list
    end,
  }):walk(inline_filter)
end
