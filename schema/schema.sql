create table if not exists nft
(
    id                text not null constraint nft_pk primary key,
    owneraddress      text,
    contract_address  text,
    tokenid           text,
    metadata_url      text,
    metadata_json     text,
    name              text,
    image             text,
    attributes        text,
    txhash            text
);

create table if not exists cursors
(
    id         text not null constraint cursor_pk primary key,
    cursor     text,
    block_num  bigint,
    block_id   text
);