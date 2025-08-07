import type { Meta, StoryObj } from '@storybook/react-vite';
import Scrollable from './scrollable';

const meta = {
  title: 'Scrollable',
  component: Scrollable,
} satisfies Meta<typeof Scrollable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SimpleScrollable: Story = {
  args: {
    children: (
      <div style={{ width: 800 }}>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium ad aperiam cupiditate deleniti dolore
        dolorum ea eaque error est expedita id ipsa iure magnam minus, modi nostrum perspiciatis porro provident quae
        quas quibusdam repudiandae similique tempore totam velit veniam veritatis vitae. Alias aut beatae consequuntur
        eius exercitationem expedita explicabo incidunt ipsa labore laboriosam, nemo nesciunt nobis, officiis quaerat
        quia quos, reiciendis rerum similique tenetur veniam veritatis voluptas voluptatem. Aspernatur commodi
        consequuntur cum deserunt dolorem doloremque earum eligendi error et excepturi explicabo fugit impedit in
        incidunt iusto nobis, non numquam odit perspiciatis praesentium quasi quidem quisquam, repellendus rerum sint
        totam veritatis voluptatem? Assumenda cupiditate enim et explicabo fuga impedit magni minus similique veritatis.
        Esse, iusto, magni. Animi aperiam delectus dignissimos dolorem enim explicabo fuga impedit ipsa ipsam magni
        placeat porro, quas quasi quod tempora veritatis vitae voluptatibus. Animi blanditiis commodi distinctio eius
        impedit laboriosam maiores molestias nam tenetur vel. Aliquid corporis delectus dolor eligendi molestias nisi
        officia temporibus ut voluptate? Alias aliquam, aperiam architecto at cumque dolore ea et eum facilis impedit
        laborum maxime nostrum, numquam officia, rerum soluta unde! Aliquam, amet beatae blanditiis deleniti dolorum
        enim eos et libero neque nostrum obcaecati odit pariatur quidem, recusandae suscipit voluptate voluptates.
        Adipisci asperiores autem cum cumque dolorum ipsam placeat sapiente veritatis. Blanditiis, dolorum nihil?
        Consequuntur cum cumque dolor fugit, ipsum iste pariatur veritatis? Aperiam itaque iure quasi ullam voluptas?
        Autem exercitationem explicabo facere fugiat harum obcaecati qui quibusdam saepe vero voluptatum? Alias, animi
        aperiam asperiores culpa deserunt dicta dolor doloremque eveniet ex ipsam, nesciunt nisi numquam odit
        perferendis porro, quasi quod reprehenderit velit vero voluptatibus? Ad architecto aspernatur consectetur
        dolores eius eveniet exercitationem expedita harum illo labore maiores minima odio quis quisquam, quo
        recusandae, rem similique soluta velit vero! Culpa cupiditate, ducimus error odio odit perspiciatis velit veniam
        vero. Accusamus at cum, cumque dolor doloremque eos necessitatibus nisi nulla sit veniam. Accusantium aliquid
        at, corporis cum, esse facere fugit iste iure minus nemo perspiciatis reprehenderit, sapiente sunt. Aliquam,
        amet asperiores aspernatur dolor doloremque doloribus dolorum eius expedita explicabo harum impedit ipsa magnam
        minus molestias natus necessitatibus nemo nisi nobis non optio, perferendis quod sequi tempore ullam, velit
        voluptas voluptate voluptatum? Accusamus alias aliquam aliquid aspernatur at cum cumque debitis deserunt dicta
        distinctio ducimus ea earum eligendi eos excepturi id incidunt, ipsa laborum laudantium magni natus neque
        nesciunt, odio optio pariatur placeat quae quaerat quam quibusdam quo reprehenderit sapiente similique soluta
        temporibus ut velit vitae. Ab cupiditate, dolor ea enim et ex explicabo facilis harum iste itaque laudantium
        minima minus, nam nesciunt placeat quas quo recusandae totam vel veritatis. Consequatur consequuntur cumque
        debitis deserunt dolor dolorem dolorum eos expedita hic, in iusto laborum libero minus molestias neque nesciunt
        non obcaecati officia pariatur provident quae quod quos repudiandae similique suscipit unde vero. Cum eaque
        expedita explicabo, in iste iure laborum mollitia placeat praesentium quos. Asperiores atque consequuntur, cum
        doloremque est exercitationem facere in ipsam, natus nulla odio possimus, quae quaerat quibusdam quos rem
        temporibus voluptas voluptate. Aspernatur aut blanditiis consequatur cupiditate dignissimos distinctio dolores
        ea earum ex explicabo harum id illum ipsa itaque iusto maxime obcaecati, odit, perspiciatis quia quibusdam quis
        quos rem repellat reprehenderit rerum, tempore tenetur velit veniam veritatis voluptatum. Adipisci asperiores
        consequuntur eius expedita ipsum laboriosam officiis quasi, quibusdam, quis rem sequi sit! Animi, aperiam
        assumenda atque dolor enim, eos ipsum laudantium magnam praesentium quidem vitae voluptatem voluptates! Culpa ea
        eius error excepturi facere laboriosam molestiae odio quibusdam quidem quos recusandae, sed sequi veritatis.
        Dignissimos ea eligendi harum nam nihil quasi soluta sunt. Ad alias aliquid animi blanditiis consectetur
        dignissimos dolorem dolores earum est eveniet fugiat impedit inventore laboriosam maiores, nihil odio porro
        quisquam quo recusandae repudiandae similique sit, suscipit tenetur ullam velit. Aspernatur beatae eligendi id
        magnam quidem repellat! Adipisci aperiam consectetur consequatur cum dolore eligendi magni nisi nobis obcaecati
        officiis perspiciatis, possimus quae quibusdam quis repellat repellendus rerum sit ullam. Accusamus alias
        aliquam aperiam asperiores assumenda atque blanditiis consequatur deleniti eaque earum excepturi facere
        inventore ipsum laudantium, molestiae nisi omnis quam quas quis quisquam quo rem repellendus sed sint ullam ut
        vel vero? Accusantium ad deleniti dolor eaque eius, iure quo rem sint unde voluptate! A adipisci architecto aut
        consequatur, consequuntur dolor dolorum eligendi enim eos eum ex expedita harum incidunt ipsam labore minima
        minus molestias nesciunt omnis pariatur provident quas quo, ratione sequi sit tempora totam voluptate! Ab alias
        aliquid amet animi consectetur consequatur dignissimos doloremque dolorum eaque error esse et harum illo
        inventore iusto libero molestiae nihil officia placeat quasi reiciendis sapiente, similique sit vel vitae. Ab
        aperiam architecto beatae, delectus deserunt eius excepturi exercitationem inventore iure laboriosam, laudantium
        obcaecati possimus provident quis quos rerum, voluptas? Alias at beatae consectetur deserunt doloribus eligendi
        est exercitationem harum illum itaque nulla obcaecati, reiciendis sint vitae voluptates. Ad alias aliquid, cum
        deleniti dolores et, id illo, ipsam iste laborum non nostrum porro provident recusandae rem sapiente sunt
        temporibus unde velit voluptatum. Amet aspernatur assumenda, blanditiis consequatur dolorum eligendi esse
        eveniet iure, libero molestias quam quidem suscipit ut. Culpa error fugit iste nulla omnis sit. Aliquam aperiam
        ex labore maiores minima, non obcaecati vel. Amet consequatur, exercitationem laudantium maxime nihil odio optio
        provident quas sed tenetur! Aliquam aspernatur autem, culpa ducimus esse excepturi illo illum molestiae odio
        omnis optio repudiandae ullam unde veritatis, voluptas voluptates voluptatum. Accusantium, alias, aliquam aut
        blanditiis cumque delectus ducimus eligendi enim facilis fugit incidunt ipsa ipsum labore mollitia neque nihil
        nulla pariatur possimus quaerat quasi repellendus reprehenderit tempore temporibus ullam ut veritatis vero.
        Blanditiis incidunt odit optio quam quod. Asperiores consectetur consequuntur deleniti doloribus ducimus ea eos
        et fuga illum iusto laborum maiores molestiae natus nemo, optio, quas qui quisquam reprehenderit sapiente
        suscipit ut vel vero voluptatem. Aperiam, culpa cupiditate deleniti earum expedita, harum iste laudantium nemo
        nostrum optio, quam quos sapiente sit vel veritatis. Adipisci architecto autem consequatur delectus deserunt,
        dolorem dolorum error fuga hic, itaque laboriosam laborum nemo neque officiis omnis perferendis veniam? Adipisci
        aliquid assumenda beatae earum eos error, eveniet illum laborum maxime nam neque optio placeat quasi quis
        ratione recusandae tempore veritatis.</div>
    ),
  },
  render(args) {
    return (
      <Scrollable
        {...args}
        style={{
          width: 300,
          height: 300,
        }}
      />
    );
  },
};
